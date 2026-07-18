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
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const EXPECTED_COLUMNS = [
  { field: 'parameter_name', label: 'Nombre del Parámetro', required: true, aliases: ['parameter_name', 'nombre', 'parametro', 'parameter', 'name'] },
  { field: 'abbreviation', label: 'Abreviatura', required: false, aliases: ['abbreviation', 'abreviatura', 'abrev', 'abbr'] },
  { field: 'unit', label: 'Unidad', required: false, aliases: ['unit', 'unidad'] },
  { field: 'group_name', label: 'Grupo', required: false, aliases: ['group_name', 'grupo', 'group'] },
  { field: 'ref_male_type', label: 'Ref. Masculino - Tipo', required: false, aliases: ['ref_male_type', 'ref_hombre_type', 'male_type', 'm_type'] },
  { field: 'ref_male_min', label: 'Ref. Masculino - Mín', required: false, aliases: ['ref_male_min', 'ref_hombre_min', 'male_min', 'm_min'] },
  { field: 'ref_male_max', label: 'Ref. Masculino - Máx', required: false, aliases: ['ref_male_max', 'ref_hombre_max', 'male_max', 'm_max'] },
  { field: 'ref_male_comparator', label: 'Ref. Masculino - Comparador', required: false, aliases: ['ref_male_comparator', 'ref_hombre_comparator', 'male_comparator', 'm_comp'] },
  { field: 'ref_male_value', label: 'Ref. Masculino - Valor', required: false, aliases: ['ref_male_value', 'ref_hombre_value', 'male_value', 'm_val'] },
  { field: 'ref_female_type', label: 'Ref. Femenino - Tipo', required: false, aliases: ['ref_female_type', 'ref_mujer_type', 'female_type', 'f_type'] },
  { field: 'ref_female_min', label: 'Ref. Femenino - Mín', required: false, aliases: ['ref_female_min', 'ref_mujer_min', 'female_min', 'f_min'] },
  { field: 'ref_female_max', label: 'Ref. Femenino - Máx', required: false, aliases: ['ref_female_max', 'ref_mujer_max', 'female_max', 'f_max'] },
  { field: 'ref_female_comparator', label: 'Ref. Femenino - Comparador', required: false, aliases: ['ref_female_comparator', 'ref_mujer_comparator', 'female_comparator', 'f_comp'] },
  { field: 'ref_female_value', label: 'Ref. Femenino - Valor', required: false, aliases: ['ref_female_value', 'ref_mujer_value', 'female_value', 'f_val'] },
];

function buildReferenceRanges(row) {
  function buildSex(type, min, max, comparator, value) {
    const t = (type || '').toLowerCase().trim();
    if (t === 'range' || t === 'rango') {
      return { type: 'range', min: parseFloat(min) || 0, max: parseFloat(max) || 0 };
    }
    if (t === 'inequality' || t === 'desigualdad') {
      return { type: 'inequality', comparator: (comparator || '<').trim(), value: parseFloat(value) || 0 };
    }
    if (t === 'categorical' || t === 'categorico' || t === 'categórico') {
      return { type: 'categorical', value: value || '' };
    }
    return null;
  }

  const male = buildSex(row.ref_male_type, row.ref_male_min, row.ref_male_max, row.ref_male_comparator, row.ref_male_value);
  const female = buildSex(row.ref_female_type, row.ref_female_min, row.ref_female_max, row.ref_female_comparator, row.ref_female_value);

  if (!male && !female) return null;
  return { male: male || { type: 'range', min: 0, max: 0 }, female: female || { type: 'range', min: 0, max: 0 } };
}

const TEMPLATE_ROWS = [
  {
    parameter_name: 'Hemoglobina',
    abbreviation: 'Hb',
    unit: 'g/dL',
    group_name: 'Hematología',
    ref_male_type: 'range', ref_male_min: '13', ref_male_max: '17', ref_male_comparator: '', ref_male_value: '',
    ref_female_type: 'range', ref_female_min: '12', ref_female_max: '16', ref_female_comparator: '', ref_female_value: '',
  },
  {
    parameter_name: 'Glucosa',
    abbreviation: 'Glu',
    unit: 'mg/dL',
    group_name: 'Química Sanguínea',
    ref_male_type: 'range', ref_male_min: '70', ref_male_max: '110', ref_male_comparator: '', ref_male_value: '',
    ref_female_type: 'range', ref_female_min: '70', ref_female_max: '110', ref_female_comparator: '', ref_female_value: '',
  },
  {
    parameter_name: 'Proteína C Reactiva',
    abbreviation: 'PCR',
    unit: 'mg/L',
    group_name: 'Inmunología',
    ref_male_type: 'inequality', ref_male_min: '', ref_male_max: '', ref_male_comparator: '<', ref_male_value: '5',
    ref_female_type: 'inequality', ref_female_min: '', ref_female_max: '', ref_female_comparator: '<', ref_female_value: '5',
  },
  {
    parameter_name: 'Factor Rh',
    abbreviation: 'Rh',
    unit: '',
    group_name: 'Inmunología',
    ref_male_type: 'categorical', ref_male_min: '', ref_male_max: '', ref_male_comparator: '', ref_male_value: 'Positivo',
    ref_female_type: 'categorical', ref_female_min: '', ref_female_max: '', ref_female_comparator: '', ref_female_value: 'Positivo',
  },
];

const TEMPLATE_HEADERS = EXPECTED_COLUMNS.map((c) => c.label);

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

  const downloadTemplate = useCallback(() => {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ...TEMPLATE_ROWS.map((row) => EXPECTED_COLUMNS.map((col) => row[col.field] || '')),
    ]);

    const colWidths = EXPECTED_COLUMNS.map((c) => {
      const headerLen = c.label.length;
      const maxDataLen = TEMPLATE_ROWS.reduce((max, r) => Math.max(max, (r[c.field] || '').length), 0);
      return { wch: Math.max(headerLen, maxDataLen) + 3 };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Parámetros');

    XLSX.writeFile(wb, 'plantilla_parametros_laboratorio.xlsx');
    show('Plantilla descargada exitosamente', 'success');
  }, [show]);

  const OLD_COLUMN_ALIASES = {
    reference_range: ['reference_range', 'rango', 'ref', 'reference'],
    reference_ranges: ['reference_ranges', 'rango_json', 'ref_json', 'ranges'],
  };

  const findVal = useCallback((item, aliases) => {
    for (const alias of aliases) {
      const key = Object.keys(item).find(
        (k) => k.toLowerCase().trim() === alias.toLowerCase().trim(),
      );
      if (key && item[key]) return String(item[key]).trim();
    }
    return '';
  }, []);

  const findRawColumn = useCallback((columns, aliases) => {
    return columns.find((c) => {
      const lower = c.toLowerCase().trim();
      return aliases.some((a) => a.toLowerCase().trim() === lower);
    });
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

        const columns = json.length > 0 ? Object.keys(json[0]) : [];
        setRawColumns(columns);

        const hasOldRefRange = !!(columns.length > 0 && (
          findRawColumn(columns, OLD_COLUMN_ALIASES.reference_range) ||
          findRawColumn(columns, OLD_COLUMN_ALIASES.reference_ranges)
        ));
        const hasNewRefColumns = !!(columns.length > 0 &&
          findRawColumn(columns, EXPECTED_COLUMNS[4].aliases)
        );

        const mapped = json.map((item, idx) => {
          const row = {
            _row: idx + 1,
            parameter_name: findVal(item, EXPECTED_COLUMNS[0].aliases),
            abbreviation: findVal(item, EXPECTED_COLUMNS[1].aliases),
            unit: findVal(item, EXPECTED_COLUMNS[2].aliases),
            group_name: findVal(item, EXPECTED_COLUMNS[3].aliases),
          };

          if (hasOldRefRange && !hasNewRefColumns) {
            const oldRange = findVal(item, OLD_COLUMN_ALIASES.reference_range);
            const oldRangesJson = findVal(item, OLD_COLUMN_ALIASES.reference_ranges);
            row.reference_range = oldRange;
            row.reference_ranges = oldRangesJson;
            row.ref_summary = oldRangesJson || oldRange || '';
          } else {
            const flatRow = {
              ref_male_type: findVal(item, EXPECTED_COLUMNS[4].aliases),
              ref_male_min: findVal(item, EXPECTED_COLUMNS[5].aliases),
              ref_male_max: findVal(item, EXPECTED_COLUMNS[6].aliases),
              ref_male_comparator: findVal(item, EXPECTED_COLUMNS[7].aliases),
              ref_male_value: findVal(item, EXPECTED_COLUMNS[8].aliases),
              ref_female_type: findVal(item, EXPECTED_COLUMNS[9].aliases),
              ref_female_min: findVal(item, EXPECTED_COLUMNS[10].aliases),
              ref_female_max: findVal(item, EXPECTED_COLUMNS[11].aliases),
              ref_female_comparator: findVal(item, EXPECTED_COLUMNS[12].aliases),
              ref_female_value: findVal(item, EXPECTED_COLUMNS[13].aliases),
            };
            const builtRanges = buildReferenceRanges(flatRow);
            row.reference_ranges = builtRanges ? JSON.stringify(builtRanges) : '';
            row.ref_summary = builtRanges ? describeRanges(builtRanges) : '';
          }

          return row;
        });

        setRows(mapped);
      } catch (err) {
        show('Error al leer el archivo: ' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [show, findVal, findRawColumn]);

  function describeRanges(ranges) {
    const desc = (label, r) => {
      if (!r) return '';
      if (r.type === 'range') return `${label}: ${r.min}-${r.max}`;
      if (r.type === 'inequality') return `${label}: ${r.comparator}${r.value}`;
      if (r.type === 'categorical') return `${label}: ${r.value}`;
      return '';
    };
    return [desc('M', ranges.male), desc('F', ranges.female)].filter(Boolean).join(' | ');
  }

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

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                color="info"
                size="small"
                startIcon={<CloudDownloadIcon />}
                onClick={downloadTemplate}
                sx={{ fontSize: '0.75rem' }}
              >
                Descargar Plantilla
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', textAlign: 'center' }}>
              Descarga la plantilla para ver las columnas requeridas. La columna <strong>parameter_name</strong> es obligatoria.
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
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Rangos Ref.</TableCell>
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
                          <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{r.ref_summary || '—'}</TableCell>
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
