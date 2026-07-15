/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Folder, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  Trash2, 
  ShieldAlert, 
  Download, 
  Lock, 
  GitMerge, 
  Check, 
  X, 
  Eye, 
  Database,
  CloudLightning,
  Activity
} from "lucide-react";

interface SecureDocument {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  status: "PENDING_VERIFICATION" | "VERIFIED" | "APPROVED" | "REJECTED" | "ARCHIVED";
  storageProvider: string;
  bucket: string;
  objectKey: string;
  version: string;
  checksum: string;
}

export default function DocumentsView() {
  const [documents, setDocuments] = useState<SecureDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [uploadQueue, setUploadQueue] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "LEGAL" | "AUDITS" | "SECURED">("ALL");
  const [alertMessage, setAlertMessage] = useState<{ type: "SUCCESS" | "ERROR" | "INFO"; text: string } | null>(null);
  
  // Modals / Interactive state
  const [showEncryptModal, setShowEncryptModal] = useState<string | null>(null);
  const [encryptPassword, setEncryptPassword] = useState("");
  const [mergeName, setMergeName] = useState("assembled_litigation_bundle.pdf");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch document metadata on mount, filter changes, or status updates
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const q = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : "";
      const tag = tagFilter ? `&tag=${tagFilter}` : "";
      const status = statusFilter ? `&status=${statusFilter}` : "";
      
      const response = await fetch(`/api/v2/documents/search?tenantId=tenant-delta${q}${tag}${status}`);
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error("Failed to load secure documents index", err);
      showAlert("ERROR", "Failed to load secure document metadata from PostgreSQL registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [searchQuery, tagFilter, statusFilter]);

  const showAlert = (type: "SUCCESS" | "ERROR" | "INFO", text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 6000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Convert files to base64 and upload to S3 compatible backend
  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const queueId = `q-${Date.now()}-${Math.random()}`;
      const newQueueItem = {
        id: queueId,
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        progress: 10,
        status: "Ingesting Bytes"
      };

      setUploadQueue((prev) => [...prev, newQueueItem]);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (!e.target?.result) throw new Error("Failed to read file bytes");
          
          setUploadQueue(prev => prev.map(item => item.id === queueId ? { ...item, progress: 40, status: "Analyzing Malware Signatures" } : item));
          
          const base64Data = (e.target.result as string).split(",")[1];
          
          setUploadQueue(prev => prev.map(item => item.id === queueId ? { ...item, progress: 75, status: "Compressing & Stripping EXIF" } : item));

          // Set default tagging based on extension
          let tag = "GENERAL";
          if (file.name.toLowerCase().includes("notice") || file.name.toLowerCase().includes("deed")) {
            tag = "LEGAL_NOTICE";
          } else if (file.name.toLowerCase().includes("id") || file.name.toLowerCase().includes("pan")) {
            tag = "DEBTOR_ID";
          } else if (file.name.toLowerCase().includes("receipt") || file.name.toLowerCase().includes("ptp")) {
            tag = "PTP_RECEIPT";
          }

          const response = await fetch("/api/v2/documents/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type || "application/octet-stream",
              fileData: base64Data,
              tags: [tag],
              visibility: "PRIVATE"
            })
          });

          const resData = await response.json();
          if (!response.ok || !resData.success) {
            throw new Error(resData.message || "Cloud upload failed");
          }

          setUploadQueue(prev => prev.map(item => item.id === queueId ? { ...item, progress: 100, status: "COMPLETED" } : item));
          showAlert("SUCCESS", `Document '${file.name}' audited, stripped of EXIF, watermarked, and saved to secure bucket.`);
          
          setTimeout(() => {
            setUploadQueue((q) => q.filter((x) => x.id !== queueId));
            fetchDocuments();
          }, 800);

        } catch (err: any) {
          console.error("Upload failed", err);
          setUploadQueue(prev => prev.map(item => item.id === queueId ? { ...item, status: "FAILED", progress: 0 } : item));
          showAlert("ERROR", `Security Guard alert on '${file.name}': ${err.message}`);
          setTimeout(() => {
            setUploadQueue((q) => q.filter((x) => x.id !== queueId));
          }, 4000);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Safe Deletion Action
  const handleDeleteDoc = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently purge '${name}' from cloud vaults and PostgreSQL indices?`)) return;
    try {
      const response = await fetch(`/api/v2/documents/${id}`, { method: "DELETE" });
      const resData = await response.json();
      if (resData.success) {
        showAlert("SUCCESS", `Document '${name}' permanently expunged from secure physical disks.`);
        fetchDocuments();
      } else {
        throw new Error(resData.message);
      }
    } catch (err: any) {
      showAlert("ERROR", `Failed to purge document: ${err.message}`);
    }
  };

  // State Workflows (Approve, Reject, Verify, Archive)
  const handleWorkflowAction = async (id: string, action: "VERIFY" | "APPROVE" | "REJECT" | "ARCHIVE" | "RESTORE") => {
    try {
      const response = await fetch(`/api/v2/documents/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await response.json();
      if (data.success) {
        showAlert("SUCCESS", `Document status transitioned to ${action}.`);
        fetchDocuments();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      showAlert("ERROR", `Failed to transition document: ${err.message}`);
    }
  };

  // Secure Audited Download URL
  const handleDownloadDoc = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/v2/documents/download/${id}`);
      const data = await response.json();
      if (data.success && data.downloadUrl) {
        showAlert("INFO", `Audit logs generated. Routing secure signed stream link.`);
        window.open(data.downloadUrl, "_blank");
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      showAlert("ERROR", `Download Throttled / Blocked: ${err.message}`);
    }
  };

  // PDF Merge selected documents
  const handleMergeSelected = async () => {
    if (selectedDocIds.length < 2) {
      showAlert("ERROR", "Please select at least 2 PDF documents to trigger merging.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/v2/documents/pdf/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentIds: selectedDocIds,
          targetFileName: mergeName
        })
      });
      const data = await response.json();
      if (data.success) {
        showAlert("SUCCESS", `Successfully concatenated ${selectedDocIds.length} PDFs into cloud-built '${mergeName}'.`);
        setSelectedDocIds([]);
        fetchDocuments();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      showAlert("ERROR", `Merge failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // PDF RC4 Lock
  const handleEncryptDoc = async () => {
    if (!showEncryptModal || !encryptPassword) return;
    setLoading(true);
    try {
      const response = await fetch("/api/v2/documents/pdf/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: showEncryptModal,
          password: encryptPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        showAlert("SUCCESS", "Document secured with 128-bit stream cipher encryption.");
        setShowEncryptModal(null);
        setEncryptPassword("");
        fetchDocuments();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      showAlert("ERROR", `Encryption lock failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Alert banner block */}
      {alertMessage && (
        <div className={`p-4 border-4 shadow-tech-sm font-mono text-xs flex items-start gap-3 animate-pulse ${
          alertMessage.type === "SUCCESS" 
            ? "bg-[#F0FFF4] border-green-600 text-green-800" 
            : alertMessage.type === "ERROR" 
              ? "bg-[#FFF5F5] border-red-600 text-red-800" 
              : "bg-[#F0F8FF] border-blue-600 text-blue-800"
        }`}>
          {alertMessage.type === "ERROR" ? (
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
          )}
          <div>
            <span className="font-bold block uppercase tracking-wider">
              {alertMessage.type === "ERROR" ? "Security Core Exception" : "Secure Log Entry Event"}
            </span>
            <p className="mt-0.5">{alertMessage.text}</p>
          </div>
        </div>
      )}

      {/* S3 File Drag and Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-4 border-dashed p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
          dragActive
            ? "border-[#FF4444] bg-[#FCFAF5]"
            : "border-[#141414] bg-white hover:bg-gray-50 shadow-tech-sm"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <UploadCloud className="w-12 h-12 text-[#141414] animate-bounce" />
        <div>
          <h4 className="text-sm font-black uppercase flex items-center justify-center gap-1.5">
            <CloudLightning className="w-4 h-4 text-orange-500 animate-pulse" /> Secure Object Vault Dropper
          </h4>
          <p className="text-[11px] font-mono text-gray-500 mt-1">
            Drag and drop or browse local files to audit. Automatically strips metadata, runs ClamAV scanner, and syncs directly with S3 / R2 buckets. Limit: 15MB.
          </p>
        </div>
      </div>

      {/* Active Ingestion stream queue */}
      {uploadQueue.length > 0 && (
        <div className="bg-white border-4 border-[#141414] p-4 shadow-tech-sm space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono block flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-red-500 animate-spin" /> System Ingestion Stream Queue
          </span>

          <div className="space-y-2.5">
            {uploadQueue.map((item) => (
              <div key={item.id} className="border-2 border-[#141414] p-3 bg-gray-50 font-mono text-xs">
                <div className="flex justify-between items-center mb-1.5 font-bold">
                  <span>{item.name} ({item.sizeKb} KB)</span>
                  <span className="text-red-600 font-black">{item.status}... {item.progress}%</span>
                </div>
                <div className="w-full bg-[#E4E3E0] h-3.5 border border-[#141414] overflow-hidden">
                  <div
                    style={{ width: `${item.progress}%` }}
                    className="bg-[#141414] h-full transition-all duration-300"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Merger Toolbar (Only visible when >= 2 PDFs are checked) */}
      {selectedDocIds.length >= 2 && (
        <div className="bg-[#FCFAF5] border-4 border-[#141414] p-4 shadow-tech-sm flex flex-col md:flex-row gap-4 items-center justify-between font-mono text-xs animate-bounce">
          <div className="flex items-center gap-3">
            <GitMerge className="w-6 h-6 text-indigo-600" />
            <div>
              <span className="font-bold block uppercase text-[10px] tracking-wider text-indigo-800">PDF Stitcher Queue</span>
              <p className="text-gray-600 font-bold">{selectedDocIds.length} source PDF documents selected for dynamic compilation.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input 
              type="text" 
              value={mergeName}
              onChange={(e) => setMergeName(e.target.value)}
              className="px-3 py-1.5 border-2 border-[#141414] bg-white w-full md:w-64"
              placeholder="Output name (e.g. bundle.pdf)"
            />
            <button 
              onClick={handleMergeSelected}
              className="px-4 py-1.5 bg-[#141414] text-white hover:bg-indigo-600 font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              Merge PDFs
            </button>
          </div>
        </div>
      )}

      {/* Filter and search lists */}
      <div className="bg-white border-4 border-[#141414] p-4 shadow-tech-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search secure documents by filename or unique tag..."
              className="w-full pl-10 pr-4 py-2 text-xs font-mono border-2 border-[#141414] bg-[#FCFAF5] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-3 py-2 text-xs font-mono border-2 border-[#141414] bg-[#FCFAF5] focus:outline-none"
            >
              <option value="">All Category Tags</option>
              <option value="LEGAL_NOTICE">Legal Notices</option>
              <option value="PTP_RECEIPT">Payment Receipts (PTP)</option>
              <option value="DEBTOR_ID">Debtor Identity Papers</option>
              <option value="MULTIPART">Chunk Multipart Files</option>
              <option value="GENERAL">General</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-mono border-2 border-[#141414] bg-[#FCFAF5] focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="VERIFIED">Verified (Clean)</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived (Old Version)</option>
            </select>
            
            <button 
              onClick={fetchDocuments}
              className="p-2 border-2 border-[#141414] bg-[#FCFAF5] hover:bg-white text-[#141414] cursor-pointer"
              title="Reload database registries"
            >
              <RefreshCw className={`w-4.5 h-4.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Documents Registry output */}
        <div className="overflow-x-auto border-2 border-[#141414]">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#FCFAF5] border-b-2 border-[#141414]">
                <th className="p-3 border-r-2 border-[#141414] w-8">
                  <span className="sr-only">Select</span>
                </th>
                <th className="p-3 border-r-2 border-[#141414] font-bold uppercase">Object Filename & Cloud Address</th>
                <th className="p-3 border-r-2 border-[#141414] font-bold uppercase text-center w-36">Workflow Status</th>
                <th className="p-3 border-r-2 border-[#141414] font-bold uppercase text-center w-28">Cloud Node</th>
                <th className="p-3 border-r-2 border-[#141414] font-bold uppercase text-center w-24">Size</th>
                <th className="p-3 border-r-2 border-[#141414] font-bold uppercase text-center w-40">Actions & Decryption</th>
                <th className="p-3 font-bold uppercase text-center w-16">Purge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading && documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-bold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Querying central PostgreSQL document registry...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-bold">
                    No active documents audited yet in current workspace.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const isPdf = doc.fileName.toLowerCase().endsWith(".pdf");
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-all">
                      <td className="p-3 border-r-2 border-[#141414] text-center bg-gray-50">
                        {isPdf ? (
                          <input 
                            type="checkbox"
                            checked={selectedDocIds.includes(doc.id)}
                            onChange={() => toggleSelectDoc(doc.id)}
                            className="cursor-pointer accent-indigo-600 scale-110"
                            title="Check for multi-file PDF merge"
                          />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="p-3 border-r-2 border-[#141414] font-bold">
                        <div className="flex items-start gap-2.5">
                          <FileText className={`w-5 h-5 shrink-0 ${isPdf ? "text-red-500" : "text-emerald-500"}`} />
                          <div className="space-y-1">
                            <span className="hover:underline cursor-pointer flex items-center gap-1.5" onClick={() => handleDownloadDoc(doc.id, doc.fileName)}>
                              {doc.fileName} <Download className="w-3.5 h-3.5 text-gray-400 inline" />
                            </span>
                            <div className="text-[9px] font-normal text-gray-400 space-y-0.5 font-mono">
                              <span className="block text-gray-500">Key: <span className="text-[#FF4444]">{doc.objectKey}</span></span>
                              <span className="block">Uploaded: {new Date(doc.uploadedAt).toLocaleString()} | Ver: {doc.version}</span>
                              <span className="block text-gray-400 font-normal">SHA-256: {doc.checksum.substring(0, 16)}...</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 border-r-2 border-[#141414] text-center bg-gray-50">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`px-2 py-0.5 border text-[9px] font-black tracking-wide ${
                            doc.status === "APPROVED" 
                              ? "bg-green-100 border-green-600 text-green-800"
                              : doc.status === "VERIFIED"
                                ? "bg-blue-100 border-blue-600 text-blue-800"
                                : doc.status === "REJECTED"
                                  ? "bg-red-100 border-red-600 text-red-800"
                                  : "bg-amber-100 border-amber-600 text-amber-800"
                          }`}>
                            {doc.status}
                          </span>
                          <span className="text-[9px] text-gray-500 font-bold uppercase">
                            {doc.tags[0] || "GENERAL"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 border-r-2 border-[#141414] text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="px-1.5 py-0.5 bg-[#141414] text-white text-[9px] font-bold flex items-center gap-1">
                            <Database className="w-2.5 h-2.5 text-orange-500" /> {doc.storageProvider}
                          </span>
                          <span className="text-[8px] text-gray-400 truncate w-24" title={doc.bucket}>
                            Bucket: {doc.bucket}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 border-r-2 border-[#141414] text-center text-gray-600">
                        {(doc.fileSize / 1024).toFixed(1)} KB
                      </td>
                      <td className="p-3 border-r-2 border-[#141414] text-center bg-gray-50">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Workflow control quick buttons */}
                          {doc.status !== "APPROVED" && (
                            <button 
                              onClick={() => handleWorkflowAction(doc.id, "APPROVE")}
                              className="p-1 border border-green-600 bg-white hover:bg-green-100 text-green-700 font-bold rounded"
                              title="Authorize & Approve Document"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {doc.status !== "REJECTED" && (
                            <button 
                              onClick={() => handleWorkflowAction(doc.id, "REJECT")}
                              className="p-1 border border-red-600 bg-white hover:bg-red-100 text-red-700 font-bold rounded"
                              title="Flag / Reject Document"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          {/* Cryptographic lock for PDF files */}
                          {isPdf && !doc.fileName.startsWith("secured_") && (
                            <button 
                              onClick={() => setShowEncryptModal(doc.id)}
                              className="p-1 border border-indigo-600 bg-white hover:bg-indigo-100 text-indigo-700 font-bold rounded"
                              title="RC4 Cryptographic Password Seal"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button 
                            onClick={() => handleDownloadDoc(doc.id, doc.fileName)}
                            className="p-1 border border-gray-600 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded"
                            title="Trigger Audited Download Stream"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.fileName)}
                          className="p-1 text-red-500 hover:bg-red-50 hover:border-red-500 border border-transparent transition-all cursor-pointer"
                          title="Purge Document permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Decryption modal overlay */}
      {showEncryptModal && (
        <div className="fixed inset-0 bg-[#141414]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs font-mono">
          <div className="bg-white border-4 border-[#141414] p-6 max-w-sm w-full shadow-tech space-y-4">
            <div className="flex items-center gap-2.5">
              <Lock className="w-6 h-6 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold text-xs uppercase tracking-wider block text-indigo-800">128-bit RC4 Stream Seal</span>
                <h4 className="text-sm font-black uppercase text-[#141414]">Sealing Legal Document</h4>
              </div>
            </div>
            <p className="text-[10px] text-gray-500">
              Applying standard 128-bit stream obfuscation cryptography to the PDF byte array. Once encrypted, the raw text dockets cannot be scanned or index-harvested.
            </p>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase">Encryption Password Key</label>
              <input 
                type="password" 
                value={encryptPassword}
                onChange={(e) => setEncryptPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 border-2 border-[#141414] bg-[#FCFAF5] focus:outline-none text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button 
                onClick={() => { setShowEncryptModal(null); setEncryptPassword(""); }}
                className="px-3 py-1.5 border-2 border-[#141414] bg-white hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleEncryptDoc}
                className="px-4 py-1.5 bg-[#141414] text-white hover:bg-indigo-600 cursor-pointer"
              >
                Seal & Encrypt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
