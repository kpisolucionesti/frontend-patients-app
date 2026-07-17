import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import * as XLSX from 'xlsx';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const EXPECTED_COLUMNS = [
  { field: 'parameter_name', label: 'Parameter Name', required: true, aliases: ['parameter_name', 'nombre', 'parametro', 'parameter', 'name'] },
  { field: 'abbreviation', label: 'Abbreviation', required: false, aliases: ['abbreviation', 'abreviatura', 'abrev', 'abbr'] },
  { field: 'unit', label: 'Unit', required: false, aliases: ['unit', 'unidad'] },
  { field: 'reference_range', label: 'Reference Range', required: false, aliases: ['reference_range', 'rango', 'ref', 'reference'] },
  { field: 'reference_ranges', label: 'Reference Ranges (JSON)', required: false, aliases: ['reference_ranges', 'rango_json', 'ref_json', 'ranges'] },
  { field: 'group_name', label: 'Group Name', required: false, aliases: ['group_name', 'grupo', 'group'] },
];

const ImportExcelModal = ({ open, onClose, onImported }) => {
  const { show } = useSnackbar();
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [rawColumns, setRawColumns] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const columnAnalysis = useMemo(() => {
    if (rawColumns.length === 0) return null;

    const normalized = rawColumns.map((c) => c.toLowerCase().trim());
    const analysis = EXPECTED_COLUMNS.map((ec) => {
      const matched = normalized.find((nc) => ec.aliases.includes(nc));
      return {
        ...ec,
        found: !!matched,
        matchedName: matched || null,
        normalizedHeaders: normalized,
      };
    });

    const unrecognized = rawColumns.filter((c) => {
      const lower = c.toLowerCase().trim();
      return !EXPECTED_COLUMNS.some((ec) => ec.aliases.includes(lower));
    });

    const missingRequired = analysis.filter((a) => a.required && !a.found);
    const valid = missingRequired.length === 0;

    return { analysis, unrecognized, valid, missingRequired };
  }, [rawColumns]);

  const validRows = useMemo(() => rows.filter((r) => r.parameter_name.trim()), [rows]);
  const invalidRows = useMemo(() => rows.filter((r) => !r.parameter_name.trim()), [rows]);

  const parseFile = useCallback((file) => {
    if (!file) return;
    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const columns = json.length > 0 ? Object.keys(json[0]) : [];
        setRawColumns(columns);

        const mapped = json.map((item, idx) => {
          const findVal = (aliases) => {
            for (const alias of aliases) {
              const key = Object.keys(item).find(
                (k) => k.toLowerCase().trim() === alias.toLowerCase().trim(),
              );
              if (key && item[key]) return String(item[key]).trim();
            }
            return '';
          };

          return {
            _row: idx + 1,
            parameter_name: findVal(EXPECTED_COLUMNS[0].aliases),
            abbreviation: findVal(EXPECTED_COLUMNS[1].aliases),
            unit: findVal(EXPECTED_COLUMNS[2].aliases),
            reference_range: findVal(EXPECTED_COLUMNS[3].aliases),
            reference_ranges: findVal(EXPECTED_COLUMNS[4].aliases),
            group_name: findVal(EXPECTED_COLUMNS[5].aliases),
          };
        });

        setRows(mapped);
      } catch (err) {
        show('Error al leer el archivo: ' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [show]);

  const handleFileSelect = useCallback((e) => {
    parseFile(e.target.files?.[0]);
  }, [parseFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      parseFile(file);
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;
      }
    } else {
      show('Solo se aceptan archivos .xlsx o .xls', 'error');
    }
  }, [parseFile, show]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleImport = useCallback(async () => {
    if (validRows.length === 0 || !columnAnalysis?.valid) return;
    setImporting(true);
    try {
      const result = await BackendAPI.labParameters.import({ data: validRows });
      setImportResult(result);
      show(`${result.created} parámetros importados${result.errors?.length ? `, ${result.errors.length} errores` : ''}`, result.errors?.length ? 'warning' : 'success');
      onImported?.();
    } catch {
      show('Error al importar', 'error');
    }
    setImporting(false);
  }, [validRows, columnAnalysis, show, onImported]);

  const handleClose = useCallback(() => {
    if (!importing) {
      setRows([]);
      setRawColumns([]);
      setFileName('');
      setImportResult(null);
      setDragOver(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
    }
  }, [importing, onClose]);

  const hasData = rows.length > 0;

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle sx={{ bgcolor: '#1565c0', color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', pb: 1.5 }}>
        IMPORTAR PARÁMETROS
      </DialogTitle>
      <DialogContent sx={{ pt: 0, px: 3 }}>
        {!hasData ? (
          <>
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                mt: 3,
                border: '2px dashed',
                borderColor: dragOver ? '#1565c0' : '#bdbdbd',
                borderRadius: 2,
                bgcolor: dragOver ? 'rgba(21,101,192,0.04)' : 'grey.50',
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#1565c0', bgcolor: 'rgba(21,101,192,0.04)' },
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <CloudUploadIcon sx={{ fontSize: 40, color: '#1565c0', mb: 1 }} />
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                Arrastra tu archivo Excel aquí o haz clic para seleccionar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Formatos aceptados: .xlsx, .xls
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', textAlign: 'center' }}>
              Columnas: <strong>parameter_name</strong> (obligatorio), abbreviation, unit, reference_range, reference_ranges (JSON), group_name
            </Typography>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 3 }}>
              <InsertDriveFileIcon color="primary" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>{fileName}</Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={() => fileInputRef.current?.click()} disabled={importing} sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                Cambiar archivo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </Box>

            {columnAnalysis && (
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: '#fafafa' }}>
                <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                  Validación de columnas
                </Typography>
                {columnAnalysis.analysis.map((col) => (
                  <Box key={col.field} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    {col.required ? (
                      col.found ? <CheckCircleIcon sx={{ fontSize: 16, color: '#2e7d32' }} />
                        : <ErrorIcon sx={{ fontSize: 16, color: '#d32f2f' }} />
                    ) : (
                      col.found ? <CheckCircleIcon sx={{ fontSize: 16, color: '#2e7d32' }} />
                        : <WarningAmberIcon sx={{ fontSize: 16, color: '#ed6c02' }} />
                    )}
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                      <strong>{col.label}</strong>
                      {col.found ? ` → encontrada como "${col.matchedName}"` : col.required ? ' → NO ENCONTRADA (obligatoria)' : ' → no encontrada (opcional)'}
                    </Typography>
                  </Box>
                ))}
                {columnAnalysis.unrecognized.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                    <WarningAmberIcon sx={{ fontSize: 16, color: '#ed6c02' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                      Columnas no reconocidas: <strong>{columnAnalysis.unrecognized.join(', ')}</strong>
                    </Typography>
                  </Box>
                )}
                <Box sx={{ mt: 1 }}>
                  {columnAnalysis.valid ? (
                    <Chip icon={<CheckCircleIcon />} label="Archivo válido — Listo para importar" color="success" size="small" variant="outlined" />
                  ) : (
                    <Chip icon={<ErrorIcon />} label={`Falta: ${columnAnalysis.missingRequired.map((c) => c.label).join(', ')}`} color="error" size="small" variant="outlined" />
                  )}
                </Box>
              </Paper>
            )}

            {importResult && (
              <Paper sx={{ p: 1.5, mb: 2, bgcolor: importResult.errors?.length ? '#fff3e0' : '#e8f5e9' }}>
                <Typography variant="body2" fontWeight={600}>
                  {importResult.created} parámetros importados exitosamente.
                </Typography>
                {importResult.errors?.length > 0 && (
                  <Typography variant="caption" color="error">
                    {importResult.errors.length} errores: {importResult.errors.map((e) => `Fila ${e.row}: ${e.error}`).join('; ')}
                  </Typography>
                )}
              </Paper>
            )}

            {!importResult && (
              <>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  {rows.length} filas leídas ({validRows.length} válidas
                  {invalidRows.length > 0 ? `, ${invalidRows.length} sin parámetro` : ''})
                </Typography>

                  <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Parámetro</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Abrev.</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Unidad</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Rango</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Grupo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow key={r._row} sx={{ bgcolor: r.parameter_name.trim() ? undefined : '#ffebee' }}>
                          <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{r._row}</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{r.parameter_name || <i style={{ color: '#999' }}>vacío</i>}</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{r.abbreviation}</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{r.unit}</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{r.reference_range || (r.reference_ranges ? 'JSON' : '')}</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{r.group_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </TableContainer>
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 1.5, gap: 0.5 }}>
        <Button onClick={handleClose} size="small" variant="outlined" color="error" disabled={importing} sx={{ fontSize: '0.75rem' }}>
          {importResult ? 'Cerrar' : 'Cancelar'}
        </Button>
        {hasData && !importResult && (
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={handleImport}
            disabled={importing || validRows.length === 0 || !columnAnalysis?.valid}
            startIcon={importing ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ fontSize: '0.75rem' }}
          >
            {importing ? 'Importando...' : `Importar ${validRows.length} parámetros`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportExcelModal;
