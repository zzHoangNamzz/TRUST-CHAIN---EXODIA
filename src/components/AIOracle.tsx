import React, { useState } from 'react';
import { BrainCircuit, UploadCloud, AlertTriangle, CheckCircle2, Loader2, FileCode2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function AIOracle() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pythonCode = `import os
import hashlib
from google import genai
from google.genai import types

# Khởi tạo Gemini Client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def verify_delivery_evidence(image_path: str, metadata: dict) -> dict:
    """
    Phân tích bằng chứng giao hàng sử dụng Gemini 3.1 Pro để phát hiện gian lận.
    """
    # 1. Kiểm tra khớp mã băm ngoại tuyến (Offline Hash)
    calculated_hash = hashlib.sha256(open(image_path, "rb").read()).hexdigest()
    if metadata.get("offline_hash") and calculated_hash != metadata["offline_hash"]:
        return {"trust_score": 0, "reason": "Mã băm không khớp. Dữ liệu đã bị can thiệp."}

    # 2. Tải lên Gemini
    prompt = """
    Bạn là một AI Oracle cho một nền tảng từ thiện minh bạch.
    Phân tích hình ảnh giao hàng từ thiện này.
    1. Đây có phải là ảnh thật, nguyên bản hay giống ảnh mạng/ảnh có sẵn?
    2. Có dấu hiệu chỉnh sửa kỹ thuật số (Photoshop, AI tạo) không?
    3. Bạn có thể xác định các vật phẩm giao hàng và ước tính số lượng không?
    4. Bối cảnh có phù hợp với việc giao hàng từ thiện không?
    
    Trả về JSON với:
    - is_authentic: boolean
    - trust_score: integer (0-100)
    - items_detected: list of strings
    - reasoning: string (giải thích bằng tiếng Việt)
    """
    
    response = client.models.generate_content(
        model='gemini-3.1-pro-preview',
        contents=[
            genai.types.Part.from_uri(image_path, mime_type="image/jpeg"),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1
        )
    )
    
    return response.text`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !preview) return;
    setLoading(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const base64Data = preview.split(',')[1];
      
      const prompt = `
        Bạn là một AI Oracle cho một nền tảng từ thiện minh bạch.
        Phân tích hình ảnh giao hàng từ thiện này.
        1. Đây có phải là ảnh thật, nguyên bản hay giống ảnh mạng/ảnh có sẵn?
        2. Có dấu hiệu chỉnh sửa kỹ thuật số (Photoshop, AI tạo) không?
        3. Bạn có thể xác định các vật phẩm giao hàng và ước tính số lượng không?
        4. Bối cảnh có phù hợp với việc giao hàng từ thiện không?
        
        Trả về JSON với:
        - is_authentic: boolean
        - trust_score: integer (0-100)
        - items_detected: list of strings
        - reasoning: string (giải thích bằng tiếng Việt)
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      setResult(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error(error);
      setResult({
        is_authentic: false,
        trust_score: 0,
        reasoning: "Lỗi kết nối đến AI Oracle. Vui lòng thử lại."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-secondary/10 rounded-xl">
          <BrainCircuit className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Oracle & Chống Gian lận</h2>
          <p className="text-text-muted">Logic Gemini 3.1 Pro để phát hiện ảnh mạng, deepfake và xác thực giao hàng.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Python Code Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-text-muted" />
            Logic Python (Backend)
          </h3>
          <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-border-color shadow-sm">
            <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-4 text-xs text-gray-400 font-mono">gemini_oracle.py</span>
            </div>
            <div className="p-4 overflow-x-auto max-h-[500px]">
              <pre className="text-sm font-mono text-gray-300">
                <code>{pythonCode}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Live Demo Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            Bản Demo Trực tiếp (Triển khai trên Trình duyệt)
          </h3>
          <div className="bg-bg-base border border-border-color rounded-xl p-6 shadow-sm">
            {!preview ? (
              <div className="border-2 border-dashed border-border-color rounded-xl p-8 text-center hover:bg-bg-hover transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <UploadCloud className="w-12 h-12 text-text-muted mb-4" />
                  <span className="font-medium text-primary">Tải lên Ảnh Giao hàng</span>
                  <span className="text-sm text-text-muted mt-2">Thử nghiệm tính năng phát hiện gian lận của AI Oracle</span>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-border-color">
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                  <button 
                    onClick={() => { setPreview(null); setFile(null); setResult(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm"
                  >
                    Thay đổi
                  </button>
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-secondary text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Đang phân tích với Gemini...</>
                  ) : (
                    <><BrainCircuit className="w-5 h-5" /> Phân tích Hình ảnh</>
                  )}
                </button>

                {result && (
                  <div className={`p-4 rounded-xl border ${result.is_authentic ? 'bg-success/10 border-success/20' : 'bg-error/10 border-error/20'}`}>
                    <div className="flex items-start gap-3">
                      {result.is_authentic ? (
                        <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-error shrink-0" />
                      )}
                      <div>
                        <h4 className={`font-bold ${result.is_authentic ? 'text-success' : 'text-error'}`}>
                          Điểm Tin cậy: {result.trust_score}/100
                        </h4>
                        <p className="text-sm mt-1 text-text-base">{result.reasoning}</p>
                        {result.items_detected && result.items_detected.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs font-semibold uppercase text-text-muted">Vật phẩm Phát hiện:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {result.items_detected.map((item: string, i: number) => (
                                <span key={i} className="bg-bg-surface border border-border-color px-2 py-1 rounded-md text-xs">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
