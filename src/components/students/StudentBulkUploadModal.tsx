'use client';

import React, { useState, useRef } from 'react';
import {
  downloadStudentTemplate,
  parseStudentExcel,
  type ParseResult,
  type ParsedStudentRow,
} from '@/modules/students/excel-import';

interface StudentBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportReport {
  total: number;
  imported: number;
  failed: number;
  results: Array<{
    row: number;
    fullName: string;
    status: 'success' | 'failed';
    error?: string;
    studentId?: string;
    studentNumber?: string;
  }>;
}

export default function StudentBulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: StudentBulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParseResult | null>(null);
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'invalid'>('all');

  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') {
      setParseError('Format file harus berupa Excel (.xlsx atau .xls)');
      setFile(null);
      setParsedData(null);
      return;
    }

    setFile(selectedFile);
    setParseError(null);
    setParsing(true);
    setImportReport(null);

    try {
      const result = await parseStudentExcel(selectedFile);
      setParsedData(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membaca berkas Excel';
      setParseError(msg);
      setParsedData(null);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setParseError(null);
    setImportReport(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartImport = async () => {
    if (!parsedData || parsedData.validRows.length === 0) return;

    setImporting(true);
    setParseError(null);

    try {
      const payloadStudents = parsedData.validRows
        .map(r => r.payload)
        .filter(Boolean);

      const res = await fetch('/api/v1/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: payloadStudents }),
      });

      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.error?.message || body.error?.code || 'Gagal melakukan impor data siswa');
      }

      setImportReport(body.data as ImportReport);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat mengimpor data';
      setParseError(msg);
    } finally {
      setImporting(false);
    }
  };

  const handleCloseReport = () => {
    onSuccess();
    onClose();
  };

  const displayedRows: ParsedStudentRow[] =
    parsedData
      ? previewFilter === 'valid'
        ? parsedData.validRows
        : previewFilter === 'invalid'
        ? parsedData.invalidRows
        : parsedData.allRows
      : [];

  return (
    <div
      className="student-profile-modal"
      role="presentation"
      onMouseDown={e => {
        if (e.target === e.currentTarget && !importing) onClose();
      }}
      style={{ zIndex: 1000 }}
    >
      <section
        className="student-profile-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-upload-title"
        style={{
          width: 'min(95vw, 840px)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 28px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 800,
                color: '#0f9f93',
                letterSpacing: '0.1em',
                marginBottom: '4px',
              }}
            >
              STUDENT MANAGEMENT / BULK IMPORT
            </span>
            <h2 id="bulk-upload-title" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              Upload Massal Siswa (.xlsx)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
              Tambahkan banyak siswa sekaligus melalui file Excel template resmi.
            </p>
          </div>
          <button
            type="button"
            className="student-profile-close"
            aria-label="Tutup modal"
            onClick={onClose}
            disabled={importing}
            style={{ position: 'static' }}
          >
            ×
          </button>
        </div>

        {/* Modal Body with scroll */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* If import is completed, show result report */}
          {importReport ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: importReport.failed === 0 ? '#e6f8ef' : '#fff9eb',
                  border: `1px solid ${importReport.failed === 0 ? '#a3e6cd' : '#fde68a'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div style={{ fontSize: '28px' }}>{importReport.failed === 0 ? '🎉' : '⚠️'}</div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#134e48', fontWeight: 700 }}>
                    {importReport.failed === 0
                      ? 'Semua Data Siswa Berhasil Diimpor!'
                      : 'Proses Impor Selesai dengan Beberapa Catatan'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
                    Total diproses: <strong>{importReport.total}</strong> | Berhasil disimpan:{' '}
                    <strong style={{ color: '#059669' }}>{importReport.imported}</strong> | Gagal:{' '}
                    <strong style={{ color: '#dc2626' }}>{importReport.failed}</strong>
                  </p>
                </div>
              </div>

              {/* Detail Table of import results */}
              <div style={{ border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '10px 16px',
                    background: '#f8fafc',
                    borderBottom: '1px solid var(--line)',
                    fontWeight: 700,
                    fontSize: '12px',
                    color: 'var(--ink)',
                  }}
                >
                  Detail Status Tiap Siswa
                </div>
                <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#475569' }}>
                        <th style={{ padding: '8px 12px' }}>Baris</th>
                        <th style={{ padding: '8px 12px' }}>Nama Siswa</th>
                        <th style={{ padding: '8px 12px' }}>Status</th>
                        <th style={{ padding: '8px 12px' }}>Keterangan / Student ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importReport.results.map((res, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: res.status === 'success' ? '#fff' : '#fff5f5',
                          }}
                        >
                          <td style={{ padding: '8px 12px', color: '#64748b' }}>#{res.row}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{res.fullName}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: res.status === 'success' ? '#dcfce7' : '#fee2e2',
                                color: res.status === 'success' ? '#15803d' : '#b91c1c',
                              }}
                            >
                              {res.status === 'success' ? 'Sukses' : 'Gagal'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: res.status === 'success' ? '#047857' : '#b91c1c' }}>
                            {res.status === 'success' ? `ID: ${res.studentNumber || res.studentId}` : res.error}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Box 1: Template Download & Guidance */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdfa, #f8fafc)',
                  border: '1px solid #ccfbf1',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: 700, color: '#0f766e' }}>
                    Gunakan Template Excel Resmi
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                    Unduh file template untuk mengisi data siswa sesuai format standar yang didukung.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadStudentTemplate}
                  className="detail-button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#fff',
                    border: '1px solid #0f9f93',
                    color: '#0f9f93',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Unduh Template (.xlsx)
                </button>
              </div>

              {/* Box 2: Dropzone / File Picker */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? 'var(--teal)' : file ? '#10b981' : '#cbd5e1'}`,
                  borderRadius: '14px',
                  background: dragActive ? '#f0fdfa' : file ? '#f8fafc' : '#ffffff',
                  padding: '24px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: file ? '#d1fae5' : '#e0f2fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: file ? '#059669' : '#0284c7',
                      fontSize: '22px',
                    }}
                  >
                    {file ? '📊' : '📁'}
                  </div>

                  {file ? (
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{file.name}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                        {(file.size / 1024).toFixed(1)} KB • Klik atau seret file lain untuk mengganti
                      </span>
                    </div>
                  ) : (
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
                        Pilih berkas Excel (.xlsx) atau seret ke sini
                      </strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                        Mendukung file Microsoft Excel (.xlsx dan .xls) hingga 500 baris
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Parsing status / Error */}
              {parsing && (
                <div style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: 'var(--teal)' }}>
                  ⏳ Membaca dan memvalidasi file Excel...
                </div>
              )}

              {parseError && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    color: '#991b1b',
                    fontSize: '12px',
                  }}
                >
                  ⚠️ {parseError}
                </div>
              )}

              {/* Box 3: Data Preview & Summary */}
              {parsedData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Stats Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '99px',
                          background: '#f1f5f9',
                          color: '#475569',
                        }}
                      >
                        Total: {parsedData.totalRows} baris
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '99px',
                          background: '#dcfce7',
                          color: '#15803d',
                        }}
                      >
                        ✓ Siap diimpor: {parsedData.validRows.length}
                      </span>
                      {parsedData.invalidRows.length > 0 && (
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '99px',
                            background: '#fee2e2',
                            color: '#b91c1c',
                          }}
                        >
                          ✕ Error: {parsedData.invalidRows.length}
                        </span>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('all')}
                        style={{
                          border: 0,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: previewFilter === 'all' ? 700 : 500,
                          background: previewFilter === 'all' ? 'var(--teal)' : 'transparent',
                          color: previewFilter === 'all' ? '#fff' : '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        Semua ({parsedData.totalRows})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('valid')}
                        style={{
                          border: 0,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: previewFilter === 'valid' ? 700 : 500,
                          background: previewFilter === 'valid' ? '#10b981' : 'transparent',
                          color: previewFilter === 'valid' ? '#fff' : '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        Valid ({parsedData.validRows.length})
                      </button>
                      {parsedData.invalidRows.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPreviewFilter('invalid')}
                          style={{
                            border: 0,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: previewFilter === 'invalid' ? 700 : 500,
                            background: previewFilter === 'invalid' ? '#ef4444' : 'transparent',
                            color: previewFilter === 'invalid' ? '#fff' : '#64748b',
                            cursor: 'pointer',
                          }}
                        >
                          Error ({parsedData.invalidRows.length})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Table Preview */}
                  <div
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      maxHeight: '230px',
                      overflowY: 'auto',
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'left', color: '#475569', position: 'sticky', top: 0, zIndex: 1 }}>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>Baris</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>Nama Lengkap</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>Gender</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>NIK</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>Tgl Lahir</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>Status</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>Catatan Validasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedRows.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                              Tidak ada data untuk filter ini.
                            </td>
                          </tr>
                        ) : (
                          displayedRows.map((r, i) => (
                            <tr
                              key={i}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                background: r.isValid ? '#ffffff' : '#fff5f5',
                              }}
                            >
                              <td style={{ padding: '6px 10px', color: '#64748b' }}>#{r.rowNumber}</td>
                              <td style={{ padding: '6px 10px', fontWeight: 600 }}>{r.fullName || '—'}</td>
                              <td style={{ padding: '6px 10px' }}>{r.gender}</td>
                              <td style={{ padding: '6px 10px' }}>{r.nik || '—'}</td>
                              <td style={{ padding: '6px 10px' }}>{r.birthDate || '—'}</td>
                              <td style={{ padding: '6px 10px' }}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    fontSize: '10px',
                                    background: r.isValid ? '#dcfce7' : '#fee2e2',
                                    color: r.isValid ? '#15803d' : '#b91c1c',
                                  }}
                                >
                                  {r.isValid ? 'Valid' : 'Perlu Diperbaiki'}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: '6px 10px',
                                  color: r.isValid ? '#059669' : '#b91c1c',
                                  maxWidth: '220px',
                                }}
                              >
                                {r.isValid ? 'Format valid' : r.errors.join(', ')}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {parsedData.invalidRows.length > 0 && (
                    <small style={{ color: '#b91c1c', fontSize: '11px' }}>
                      * Baris yang berstatus Error akan otomatis dilewati saat proses simpan.
                    </small>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '16px',
            borderTop: '1px solid var(--line)',
            marginTop: '16px',
          }}
        >
          {importReport ? (
            <button
              type="button"
              className="primary-button"
              onClick={handleCloseReport}
              style={{ minWidth: '120px' }}
            >
              Selesai & Muat Ulang
            </button>
          ) : (
            <>
              <button
                type="button"
                className="detail-button"
                onClick={file ? handleReset : onClose}
                disabled={importing}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  color: '#475569',
                }}
              >
                {file ? 'Ganti File' : 'Batal'}
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleStartImport}
                disabled={!parsedData || parsedData.validRows.length === 0 || importing}
                style={{
                  minWidth: '140px',
                  opacity: !parsedData || parsedData.validRows.length === 0 || importing ? 0.6 : 1,
                }}
              >
                {importing
                  ? 'Menyimpan...'
                  : `Impor ${parsedData?.validRows.length ? `${parsedData.validRows.length} Siswa` : ''}`}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
