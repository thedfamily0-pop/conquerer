import { useState } from 'react';
import { COLOR_PICKER } from '../data/scheduleData';

interface Props { value: string; onChange: (color: string) => void; }

export function ColorPicker({ value, onChange }: Props) {
  const [showHex, setShowHex] = useState(false);
  return (
    <div className="color-picker-container">
      <div className="color-swatches">
        {COLOR_PICKER.map(color => (
          <button
            key={color}
            type="button"
            className={`color-swatch ${value === color ? 'selected' : ''}`}
            style={{ background: color }}
            onClick={() => onChange(color)}
            title={color}
            aria-label={`Select colour ${color}`}
          />
        ))}
        <button
          type="button"
          className="color-swatch hex-toggle"
          onClick={() => setShowHex(!showHex)}
          title="Enter custom hex code"
          aria-label="Enter custom colour code"
        >
          #
        </button>
      </div>
      {showHex && (
        <div className="color-hex-row">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="color-wheel-input"
            title="Pick any colour"
          />
          <input
            type="text"
            value={value}
            maxLength={7}
            placeholder="#8b5cf6"
            onChange={e => { const hex = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(hex)) onChange(hex); }}
            className="color-hex-input"
          />
          <span className="color-preview" style={{ background: value }}/>
        </div>
      )}
    </div>
  );
}
