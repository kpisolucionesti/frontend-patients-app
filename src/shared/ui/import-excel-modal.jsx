import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import * as XLSX from 'xlsx';
import { useSnackbar } from '../../hooks/useSnackbar';

const GenericImportModal = ({
  open, onClose, onImported,
  columns = [], templateRows = [], templateName = 'plantilla',
  sectionLabel = 'Datos', apiImportFn, rowFormatter,
}) => {
  const { show } = useSnackbar();
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [rawColumns, setRawColumns] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const templateHeaders = useMemo(() => columns.map((c) => c.label), [columns]);

  const columnAnalysis = useMemo(() => {
    if (rawColumns.length === 0) return null;
    const normalized = rawColumns.map((c) => c.toLowerCase().trim());
    const analysis = columns.map((ec) => {
      const matched = normalized.find((nc) => ec.aliases.includes(nc));
      return { ...ec, found: !!matched, matchedName: matched || null };
    });
    const unrecognized = rawColumns.filter((c) => {
      const lower = c.toLowerCase().trim();
      return !columns.some((ec) => ec.aliases.includes(lower));
    });
    const missingRequired = analysis.filter((a) => a.required && !a.found);
    return { analysis, unrecognized, valid: missingRequired.length === 0, missingRequired };
  }, [rawColumns, columns]);

  const validRows = useMemo(() => {
    const requiredFields = columns.filter((c) => c.required).map((c) => c.field);
    return rows.filter((r) => requiredFields.every((f) => r[f] && String(r[f]).trim()));
  }, [rows, columns]);
  const invalidRows = useMemo(() => rows.filter((r) => !validRows.includes(r)), [rows, validRows]);

  const findVal = useCallback((item, aliases) => {
    for (const alias of aliases) {
      const key = Object.keys(item).find((k) => k.toLowerCase().trim() === alias.toLowerCase().trim());
      if (key && item[key]) return String(item[key]).trim();
    }
    return '';
  }, []);

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
        setRawColumns(json.length > 0 ? Object.keys(json[0]) : []);
        const mapped = json.map((item, idx) => {
          const row = { _row: idx + 1 };
          columns.forEach((col) => { row[col.field] = findVal(item, col.aliases); });
          return rowFormatter ? rowFormatter(row) : row;
        });
        setRows(mapped);
      } catch (err) {
        show('Error al leer el archivo: ' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [show, findVal, columns, rowFormatter]);

  const downloadTemplate = useCallback(() => {
    const ws = XLSX.utils.aoa_to_sheet([
      templateHeaders,
      ...templateRows.map((row) => columns.map((col) => row[col.field] || '')),
    ]);
    const colWidths = columns.map((c) => {
      const hl = c.label.length;
      const mdl = templateRows.reduce((max, r) => Math.max(max, (r[c.field] || '').length), 0);
      return { wch: Math.max(hl, mdl) + 3 };
    });
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, `${templateName}.xlsx`);
    show('Plantilla descargada exitosamente', 'success');
  }, [show, templateHeaders, templateRows, columns, templateName]);

  const handleFileSelect = useCallback((e) => { parseFile(e.target.files?.[0]); }, [parseFile]);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      parseFile(file);
      if (fileInputRef.current) { const dt = new DataTransfer(); dt.items.add(file); fileInputRef.current.files = dt.files; }
    } else { show('Solo se aceptan archivos .xlsx o .xls', 'error'); }
  }, [parseFile, show]);

  const handleImport = useCallback(async () => {
    if (validRows.length === 0 || !columnAnalysis?.valid) return;
    setImporting(true);
    try {
      const result = apiImportFn ? await apiImportFn(validRows) : { created: validRows.length, errors: [] };
      setImportResult(result);
      const hasErr = result.errors?.length > 0;
      show(`${result.created || 0} ${sectionLabel.toLowerCase()} importados${hasErr ? `, ${result.errors.length} errores` : ''}`, hasErr ? 'warning' : 'success');
      onImported?.();
    } catch { show('Error al importar', 'error'); }
    setImporting(false);
  }, [validRows, columnAnalysis, apiImportFn, sectionLabel, show, onImported]);

  const handleClose = useCallback(() => {
    if (!importing) {
      setRows([]); setRawColumns([]); setFileName(''); setImportResult(null); setDragOver(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
    }
  }, [importing, onClose]);

  const hasData = rows.length > 0;

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>
        IMPORTAR {sectionLabel.toUpperCase()}
      </DialogTitle>
      <DialogContent sx={{ px: 3 }}>
        {!hasData ? (
          <Box sx={{ mt: 2 }}>
            <Box onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)} onClick={() => fileInputRef.current?.click()}
              sx={{ border: '2px dashed', borderColor: dragOver ? 'primary.main' : 'text.disabled', borderRadius: 2,
                bgcolor: dragOver ? 'action.hover' : 'grey.50', p: 4, textAlign: 'center', cursor: 'pointer',
                transition: 'border-color 0.15s, background-color 0.15s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} style={{ display: 'none' }} />
              <CloudUploadIcon sx={{ fontSize: 28, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Arrastra tu archivo Excel aquí o haz clic para seleccionar</Typography>
              <Typography variant="caption" color="text.secondary">Formatos aceptados: .xlsx, .xls</Typography>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button variant="outlined" color="info" size="small" startIcon={<CloudDownloadIcon />}
                onClick={downloadTemplate} sx={{ fontSize: '0.75rem' }}>Descargar Plantilla</Button>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2 }}>
              <InsertDriveFileIcon color="primary" />
              <Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" fontWeight={600} noWrap>{fileName}</Typography></Box>
              <Button size="small" variant="outlined" onClick={() => fileInputRef.current?.click()} disabled={importing} sx={{ fontSize: '0.7rem' }}>Cambiar archivo</Button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} style={{ display: 'none' }} />
            </Box>
            {columnAnalysis && (
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: 'action.hover' }}>
                <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block' }}>Validación de columnas</Typography>
                {columnAnalysis.analysis.map((col) => (
                  <Box key={col.field} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    {col.required ? (col.found ? <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} /> : <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />)
                      : (col.found ? <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} /> : <WarningAmberIcon sx={{ fontSize: 16, color: 'warning.main' }} />)}
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                      <strong>{col.label}</strong>{col.found ? ` → "${col.matchedName}"` : col.required ? ' → NO ENCONTRADA (obligatoria)' : ' → opcional'}
                    </Typography>
                  </Box>
                ))}
                {columnAnalysis.unrecognized.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                    <WarningAmberIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Columnas no reconocidas: <strong>{columnAnalysis.unrecognized.join(', ')}</strong></Typography>
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
              <Paper sx={{ p: 1.5, mb: 2, bgcolor: importResult.errors?.length ? 'warning.light' : 'success.light' }}>
                <Typography variant="body2" fontWeight={600}>{importResult.created || 0} {sectionLabel.toLowerCase()} importados.</Typography>
                {importResult.errors?.length > 0 && (
                  <Typography variant="caption" color="error">{importResult.errors.length} errores: {importResult.errors.map((e) => `Fila ${e.row}: ${e.error}`).join('; ')}</Typography>
                )}
              </Paper>
            )}
            {!importResult && (
              <TableContainer sx={{ maxHeight: '40vh', minHeight: 200 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>#</TableCell>
                      {columns.map((c) => (
                        <TableCell key={c.field} sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>{c.label.split(' - ')[0]}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r._row} sx={{ bgcolor: validRows.includes(r) ? undefined : '#ffebee' }}>
                        <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{r._row}</TableCell>
                        {columns.map((c) => (
                          <TableCell key={c.field} sx={{ fontSize: '0.7rem', p: 0.5 }}>
                            {r[c.field] || <Typography component="i" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>vacío</Typography>}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} size="small" variant="outlined" color="error" disabled={importing}>{importResult ? 'Cerrar' : 'Cancelar'}</Button>
        {hasData && !importResult && (
          <Button size="small" variant="contained" color="success" onClick={handleImport}
            disabled={importing || validRows.length === 0 || !columnAnalysis?.valid}
            startIcon={importing ? <CircularProgress size={14} color="inherit" /> : null}>
            {importing ? 'Importando...' : `Importar ${validRows.length} ${sectionLabel.toLowerCase()}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GenericImportModal;
