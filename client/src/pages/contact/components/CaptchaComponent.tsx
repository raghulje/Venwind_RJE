import { useState, useEffect, useRef } from 'react';

interface CaptchaComponentProps {
  onVerify: (verified: boolean) => void;
}

export default function CaptchaComponent({ onVerify }: CaptchaComponentProps) {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captchaTextRef = useRef<string>(''); // Use ref to avoid stale state issues

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 5; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    captchaTextRef.current = text; // Update ref immediately
    setCaptchaText(text);
    setIsVerified(false);
    setUserInput('');
    onVerify(false);
    drawCaptcha(text);
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise lines
    ctx.strokeStyle = '#ccc';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add slight rotation and position variation for each character
    const charSpacing = canvas.width / (text.length + 1);
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      ctx.translate(charSpacing * (i + 1), canvas.height / 2);
      ctx.rotate((Math.random() - 0.5) * 0.3); // Random rotation between -0.15 and 0.15
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    // Add noise dots
    ctx.fillStyle = '#999';
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1,
        1
      );
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setUserInput(value);

    // Use ref to get current captcha text to avoid stale state issues
    if (value === captchaTextRef.current) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setIsVerified(false);
      onVerify(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded bg-gray-50">
      <div className="flex items-center space-x-4 mb-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter the code shown below
          </label>
          <div className="flex items-center space-x-3">
            <canvas
              ref={canvasRef}
              width={150}
              height={50}
              className="border border-gray-300 rounded bg-white"
            />
            <button
              type="button"
              onClick={generateCaptcha}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
              title="Refresh captcha"
            >
              <i className="ri-refresh-line text-lg"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Enter captcha code"
          maxLength={5}
          className={`flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
            isVerified
              ? 'border-green-500 focus:ring-green-500'
              : userInput
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-[#8DC63F]'
          }`}
        />
        {isVerified && (
          <div className="text-green-600">
            <i className="ri-checkbox-circle-fill text-2xl"></i>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <div className="font-bold">CAPTCHA</div>
        <div className="flex space-x-2">
          <a href="https://www.google.com/intl/en/policies/privacy/" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy</a>
          <span>-</span>
          <a href="https://www.google.com/intl/en/policies/terms/" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms</a>
        </div>
      </div>
    </div>
  );
}

