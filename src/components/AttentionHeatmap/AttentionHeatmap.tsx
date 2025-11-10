import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store';
import { GazeData } from '../../types/wellness';

const AttentionHeatmap: React.FC = () => {
  const { gazeData } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heatmapData, setHeatmapData] = useState<Array<{x: number, y: number, value: number}>>([]);
  const [intensity, setIntensity] = useState(0.5);

  useEffect(() => {
    // Use GazeData type instead of GazePoint
    const newData = gazeData.map((gaze: GazeData) => ({
      x: gaze.x,
      y: gaze.y,
      value: intensity
    }));
    
    setHeatmapData(prev => [...prev, ...newData].slice(-1000));
  }, [gazeData, intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create gradient for heat points
    heatmapData.forEach(point => {
      const gradient = ctx.createRadialGradient(
        point.x * canvas.width / 100,
        point.y * canvas.height / 100,
        0,
        point.x * canvas.width / 100,
        point.y * canvas.height / 100,
        50
      );

      // Red to yellow gradient for heatmap
      gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Draw screen regions
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Main content area (center)
    ctx.strokeRect(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.7);
    
    // Navigation areas
    ctx.strokeRect(canvas.width * 0.05, canvas.height * 0.05, canvas.width * 0.9, canvas.height * 0.05); // Top nav
    ctx.strokeRect(canvas.width * 0.05, canvas.height * 0.85, canvas.width * 0.9, canvas.height * 0.1); // Bottom nav
    
    // Sidebars
    ctx.strokeRect(canvas.width * 0.02, canvas.height * 0.1, canvas.width * 0.08, canvas.height * 0.7); // Left sidebar
    ctx.strokeRect(canvas.width * 0.9, canvas.height * 0.1, canvas.width * 0.08, canvas.height * 0.7); // Right sidebar

  }, [heatmapData]);

  const getAttentionZones = () => {
    if (heatmapData.length === 0) return [];
    
    const zones = [
      { name: 'Content Area', x: 50, y: 45, count: 0 },
      { name: 'Navigation', x: 50, y: 7, count: 0 },
      { name: 'Sidebar Left', x: 6, y: 45, count: 0 },
      { name: 'Sidebar Right', x: 94, y: 45, count: 0 },
      { name: 'Footer', x: 50, y: 87, count: 0 }
    ];

    heatmapData.forEach(point => {
      if (point.x > 10 && point.x < 90 && point.y > 10 && point.y < 80) {
        zones[0].count++; // Content area
      } else if (point.y <= 10) {
        zones[1].count++; // Navigation
      } else if (point.x <= 10) {
        zones[2].count++; // Left sidebar
      } else if (point.x >= 90) {
        zones[3].count++; // Right sidebar
      } else if (point.y >= 80) {
        zones[4].count++; // Footer
      }
    });

    return zones.sort((a, b) => b.count - a.count);
  };

  const attentionZones = getAttentionZones();

  return (
    <div className="card">
      <div className="heatmap-header">
        <h3>Attention Heatmap</h3>
        <div className="heatmap-controls">
          <label>
            Intensity:
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
            />
          </label>
        </div>
      </div>
      
      <p>Visual representation of where you focus most on screen</p>
      
      <div className="heatmap-container">
        <canvas 
          ref={canvasRef}
          width={800}
          height={600}
          style={{
            width: '100%',
            height: '400px',
            background: '#1e293b',
            borderRadius: '8px',
            border: '2px solid #374151'
          }}
        />
      </div>
      
      <div className="heatmap-analysis">
        <h4>Attention Distribution</h4>
        <div className="attention-zones">
          {attentionZones.map((zone, index) => (
            <div key={zone.name} className="attention-zone">
              <span className="zone-name">{zone.name}</span>
              <div className="zone-bar">
                <div 
                  className="zone-fill"
                  style={{ 
                    width: `${(zone.count / Math.max(1, heatmapData.length)) * 100}%`,
                    backgroundColor: index === 0 ? '#ef4444' : 
                                   index === 1 ? '#f59e0b' : 
                                   index === 2 ? '#10b981' : '#3b82f6'
                  }}
                />
              </div>
              <span className="zone-percentage">
                {Math.round((zone.count / Math.max(1, heatmapData.length)) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="heatmap-legend">
        <div className="legend-item">
          <div className="legend-color high-focus"></div>
          <span>High Attention</span>
        </div>
        <div className="legend-item">
          <div className="legend-color medium-focus"></div>
          <span>Medium Attention</span>
        </div>
        <div className="legend-item">
          <div className="legend-color low-focus"></div>
          <span>Low Attention</span>
        </div>
      </div>

      <div className="heatmap-insights">
        <h4>Insights</h4>
        {attentionZones.length > 0 && (
          <div className="insights-content">
            <p>
              You spend most of your attention in the <strong>{attentionZones[0].name.toLowerCase()}</strong>.
              {attentionZones[0].name === 'Content Area' && ' This indicates good focus on main content.'}
              {attentionZones[0].name === 'Navigation' && ' Consider if you\'re spending too much time navigating.'}
              {attentionZones[0].name.includes('Sidebar') && ' Sidebar attention might indicate distraction.'}
            </p>
            {attentionZones[0].count / heatmapData.length > 0.6 && (
              <p className="positive">
                ✅ Excellent focus on primary content areas.
              </p>
            )}
            {attentionZones[0].count / heatmapData.length < 0.3 && (
              <p className="warning">
                ⚠️ Attention is distributed across many areas. Consider focusing on one task at a time.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttentionHeatmap;