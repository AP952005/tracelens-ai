'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    FileText, Download, Printer, ArrowLeft, Shield, Calendar,
    AlertTriangle, CheckCircle, Clock, Lock, Eye, Share2
} from 'lucide-react';
import { InvestigationReport, InvestigationCase } from '@root/types/investigation';

export default function ReportPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const [report, setReport] = useState<InvestigationReport | null>(null);
    const [caseData, setCaseData] = useState<InvestigationCase | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [reportRes, caseRes] = await Promise.all([
                    fetch(`/api/report/${caseId}`),
                    fetch(`/api/cases/${caseId}`)
                ]);

                if (reportRes.ok) {
                    const reportData = await reportRes.json();
                    setReport(reportData);
                }

                if (caseRes.ok) {
                    const caseDataJson = await caseRes.json();
                    setCaseData(caseDataJson);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        if (caseId) fetchData();
    }, [caseId]);

    const getClassificationStyle = (level: string) => {
        switch (level) {
            case 'TOP SECRET':
                return { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' };
            case 'SECRET':
                return { bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-700' };
            case 'CONFIDENTIAL':
                return { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-600' };
            default:
                return { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' };
        }
    };

    const downloadAsPDF = async () => {
        if (!reportRef.current) return;

        setDownloading(true);

        try {
            // Dynamic import of html2canvas and jspdf
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const element = reportRef.current;

            // Create canvas from the report element
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            // Calculate dimensions
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            const pdf = new jsPDF('p', 'mm', 'a4');

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Download the PDF
            pdf.save(`TraceLens_Report_${caseId.substring(0, 8)}.pdf`);

        } catch (error) {
            console.error('PDF generation failed:', error);
            // Fallback: Open print dialog
            window.print();
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05070d] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-cyan-500 border-t-transparent"
                    />
                    <div className="text-cyan-400 font-mono">GENERATING REPORT...</div>
                </motion.div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-[#05070d] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <AlertTriangle className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-white mb-2">Report Not Available</h2>
                    <p className="text-gray-400 mb-6">
                        This investigation report hasn&apos;t been generated yet. Complete the investigation to generate a report.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => router.push(`/case/${caseId}`)}
                        className="px-6 py-3 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400"
                    >
                        Return to Case
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    const classStyle = getClassificationStyle(report.classificationLevel);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 print:bg-white">
            {/* Floating controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-8 right-8 flex gap-3 print:hidden z-50"
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.push(`/case/${caseId}`)}
                    className="p-4 bg-gray-800 text-white rounded-full shadow-xl hover:bg-gray-700 transition-colors"
                    title="Back to Case"
                >
                    <ArrowLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={downloadAsPDF}
                    disabled={downloading}
                    className="p-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full shadow-xl hover:from-red-500 hover:to-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download PDF"
                >
                    {downloading ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                    ) : (
                        <Download className="w-5 h-5" />
                    )}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => window.print()}
                    className="p-4 bg-cyan-600 text-white rounded-full shadow-xl hover:bg-cyan-500 transition-colors"
                    title="Print Report"
                >
                    <Printer className="w-5 h-5" />
                </motion.button>
            </motion.div>

            {/* Report document */}
            <div className="max-w-4xl mx-auto py-8 px-4 print:p-0">
                <motion.div
                    ref={reportRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white shadow-2xl print:shadow-none"
                >
                    {/* Classification banner */}
                    <div className={`${classStyle.bg} ${classStyle.text} py-2 text-center font-bold text-sm tracking-widest`}>
                        {report.classificationLevel} // OFFICIAL USE ONLY
                    </div>

                    <div className="p-12 print:p-8">
                        {/* Header */}
                        <header className="border-b-4 border-gray-900 pb-6 mb-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 rounded bg-gray-900 flex items-center justify-center">
                                            <Shield className="w-7 h-7 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900">
                                                FORENSIC INVESTIGATION REPORT
                                            </h1>
                                            <p className="text-sm text-gray-500 font-mono">
                                                TRACELENS // OSINT DIVISION
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-block px-4 py-2 ${classStyle.bg} ${classStyle.text} ${classStyle.border} border-2 font-bold text-sm tracking-wider`}>
                                        {report.classificationLevel}
                                    </div>
                                </div>
                            </div>

                            {/* Case metadata */}
                            <div className="mt-6 grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Case ID</div>
                                    <div className="font-mono font-bold text-gray-900">{report.caseId.substring(0, 12)}...</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Generated</div>
                                    <div className="font-bold text-gray-900">{new Date(report.generatedAt).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Target</div>
                                    <div className="font-bold text-gray-900">{caseData?.query || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Threat Score</div>
                                    <div className={`font-black text-xl ${(caseData?.threatScore || 0) > 70 ? 'text-red-600' : (caseData?.threatScore || 0) > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {caseData?.threatScore || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Executive Summary */}
                        <motion.section
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-10"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-cyan-600" />
                                <h2 className="text-xl font-bold text-gray-900 border-b-2 border-cyan-500 pb-1">
                                    EXECUTIVE SUMMARY
                                </h2>
                            </div>
                            <div
                                className="text-justify leading-relaxed text-gray-700 bg-gray-50 p-4 rounded border-l-4 border-cyan-500"
                                dangerouslySetInnerHTML={{ __html: report.summary }}
                            />
                        </motion.section>

                        {/* Report sections */}
                        {report.sections.map((section, idx) => (
                            <motion.section
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + idx * 0.1 }}
                                className="mb-10"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    {section.type === 'summary' && <Eye className="w-5 h-5 text-cyan-600" />}
                                    {section.type === 'details' && <FileText className="w-5 h-5 text-blue-600" />}
                                    {section.type === 'recommendation' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    {section.type === 'technical' && <Lock className="w-5 h-5 text-purple-600" />}
                                    <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-300 pb-1 flex-1">
                                        {section.title.toUpperCase()}
                                    </h2>
                                </div>
                                <div
                                    className="text-justify leading-relaxed text-gray-700 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2 [&_li]:my-1 [&_strong]:font-bold [&_p]:my-2"
                                    dangerouslySetInnerHTML={{ __html: section.content }}
                                />
                            </motion.section>
                        ))}

                        {/* Key Statistics */}
                        {caseData && (
                            <motion.section
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="mb-10 bg-gray-900 text-white p-6 rounded-lg"
                            >
                                <h2 className="text-xl font-bold mb-4 text-cyan-400">KEY STATISTICS</h2>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-white/10 rounded">
                                        <div className="text-3xl font-black text-cyan-400">{caseData.socialProfiles.length}</div>
                                        <div className="text-xs text-gray-400 uppercase">Profiles Found</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/10 rounded">
                                        <div className="text-3xl font-black text-red-400">{caseData.breaches.length}</div>
                                        <div className="text-xs text-gray-400 uppercase">Data Breaches</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/10 rounded">
                                        <div className="text-3xl font-black text-yellow-400">{caseData.chainOfCustody.length}</div>
                                        <div className="text-xs text-gray-400 uppercase">Evidence Items</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/10 rounded">
                                        <div className={`text-3xl font-black ${caseData.threatScore > 70 ? 'text-red-400' : caseData.threatScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                                            {caseData.threatScore}
                                        </div>
                                        <div className="text-xs text-gray-400 uppercase">Threat Score</div>
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* Footer */}
                        <footer className="mt-16 pt-8 border-t-2 border-gray-300">
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        LAW ENFORCEMENT SENSITIVE
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(report.generatedAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span>TRACELENS FORENSICS</span>
                                    <span className="font-bold">PAGE 1 OF 1</span>
                                </div>
                            </div>
                            <div className={`mt-4 text-center py-2 ${classStyle.bg} ${classStyle.text} text-xs font-bold tracking-widest`}>
                                {report.classificationLevel} // OFFICIAL USE ONLY
                            </div>
                        </footer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
