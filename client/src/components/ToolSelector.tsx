import React, { useState } from "react";

interface Tool {
  id: string;
  name: string;
  cost: number;
  icon: string;
  shortDesc: string;
  subtitle: string;
  description: string;
  science: string;
  result: string;
  isSpecial?: boolean;
  image?: string;
}

const tools: Tool[] = [
  {
    id: "scan",
    name: "Multispectral Imaging",
    cost: 50,
    icon: "🛰️",
    shortDesc: "5x5 density scan from orbit",
    subtitle: "Satellite-Based Remote Sensing",
    description: "Satellites capture light spectrums that human eyes cannot see, such as Infrared and Thermal wavelengths.",
    science: "Buried stone walls retain heat and moisture differently than loose soil. This creates temperature variations detectable from orbit.",
    result: "Vegetation growing over buried walls often struggles (less moisture), while plants over ancient ditches grow taller. In infrared images, this creates a distinct 'outline' of buildings hidden beneath crops or jungle.",
  },
  {
    id: "lidar",
    name: "LiDAR Drone",
    cost: 100,
    icon: "🚁",
    image: "/game-icons/lidar-drone.png",
    shortDesc: "2x2 proximity detection",
    subtitle: "Aerial Laser Scanning",
    description: "A drone flies overhead firing millions of laser pulses per second, measuring the precise distance to the ground surface.",
    science: "LiDAR (Light Detection And Ranging) can penetrate vegetation canopy and detect subtle elevation changes—even a few centimeters—that indicate buried walls, platforms, or collapsed structures.",
    result: "The 2x2 scan area shows proximity heat colors: red-orange means a structure is very close (within 1-2 tiles), orange means nearby (3-6 tiles), blue-gray means nothing detected within range.",
  },
  {
    id: "drill",
    name: "Ground Penetrating Radar",
    cost: 250,
    icon: "📡",
    shortDesc: "Precise single-tile confirmation",
    subtitle: "Subsurface Detection System",
    description: "A precision tool that fires radio waves into the earth. Soft dirt absorbs the wave, but buried stone walls bounce it back as an echo.",
    science: "GPR antennas emit electromagnetic pulses that travel through soil until they hit a material with different electrical properties—like ancient masonry or metal artifacts.",
    result: "Use this to 'ping' specific tiles and confirm the exact location of a structure before committing to expensive excavation. The echo reveals what lies beneath.",
  },
  {
    id: "excavate",
    name: "Archaeological Excavation",
    cost: 500,
    icon: "⛏️",
    shortDesc: "Reveal structures, earn $2000 reward",
    subtitle: "Manual Precision Dig",
    description: "The most expensive and time-consuming method: deploying a trained excavation team to carefully remove soil layer by layer.",
    science: "Each centimeter of earth may contain artifacts that tell stories spanning millennia. Rushing destroys context forever—the position of a shard can reveal more than the shard itself.",
    result: "Successful excavation uncovers complete structures and yields research grants (+$2,000). However, excavating empty ground wastes precious budget on labor, equipment, and site restoration.",
  },
  {
    id: "terraquest",
    name: "TerraQuest Explorer",
    cost: 60,
    icon: "🤖",
    image: "/game-icons/terraquest.png",
    shortDesc: "Reveals ALL hidden structures (one-time use)",
    subtitle: "Autonomous Hybrid Vehicle",
    description: "TerraQuest - an unmanned autonomous vehicle that can fly like a drone and drive like a rover, equipped to see above and below the earth's surface combined with a unique Archaeological Scoring system.",
    science: "Combining aerial LiDAR, ground-penetrating radar, and AI-driven pattern recognition, TerraQuest can identify buried structures across the entire survey area in a single deployment.",
    result: "When activated, TerraQuest scans the entire grid and reveals the locations of ALL remaining hidden structures. This powerful tool can only be used ONCE per mission and must be unlocked by finding 3 structures first.",
    isSpecial: true,
  },
];

interface ToolSelectorProps {
  isOpen: boolean;
  currentTool: string;
  onSelectTool: (toolId: string) => void;
  onClose: () => void;
  structuresFound?: number;
  terraquestUsed?: boolean;
}

export default function ToolSelector({
  isOpen,
  currentTool,
  onSelectTool,
  onClose,
  structuresFound = 0,
  terraquestUsed = false
}: ToolSelectorProps) {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  if (!isOpen) return null;

  const isTerraQuestLocked = structuresFound < 3;

  const handleSelect = (toolId: string) => {
    if (toolId === 'terraquest') {
      if (isTerraQuestLocked) return;
      if (terraquestUsed) return;
    }
    onSelectTool(toolId);
    onClose();
  };

  const hoveredToolData = hoveredTool ? tools.find(t => t.id === hoveredTool) : null;

  return (
    <div className="tool-selector-overlay" data-testid="overlay-tool-selector">
      <div className="tool-selector-backdrop" onClick={onClose}></div>
      <div className="tool-selector-compact">
        <div className="tool-compact-header">
          <h2>SELECT TOOL</h2>
          <button className="tool-selector-close" onClick={onClose} data-testid="button-close-tools">×</button>
        </div>

        <div className="tool-compact-grid">
          {tools.map((tool) => {
            const isLocked = tool.id === 'terraquest' && isTerraQuestLocked;
            const isUsed = tool.id === 'terraquest' && terraquestUsed;
            const isDisabled = isLocked || isUsed;

            return (
              <div
                key={tool.id}
                className={`tool-compact-item ${currentTool === tool.id ? 'active' : ''} ${isDisabled ? 'disabled' : ''} ${tool.isSpecial ? 'special' : ''}`}
                onClick={() => handleSelect(tool.id)}
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={(e) => {
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (!relatedTarget?.closest('.tool-detail-panel')) {
                    setHoveredTool(null);
                  }
                }}
                data-testid={`button-select-tool-${tool.id}`}
              >
                <div className="tool-compact-icon">
                  {isLocked ? '🔒' : isUsed ? '✅' : (tool.image ? <img src={tool.image} alt={tool.name} className="tool-icon-img" style={{ width: '32px', height: '32px', objectFit: 'contain' }} /> : tool.icon)}
                </div>
                <div className="tool-compact-info">
                  <div className="tool-compact-name">
                    {tool.name}
                    {isLocked && <span className="tool-locked-text"> (LOCKED)</span>}
                    {isUsed && <span className="tool-used-text"> (USED)</span>}
                  </div>
                  <div className="tool-compact-desc">
                    {isLocked ? `Unlock: Find ${3 - structuresFound} more structure(s)` : tool.shortDesc}
                  </div>
                </div>
                <div className={`tool-compact-cost ${tool.isSpecial ? 'special-cost' : ''}`}>
                  -${tool.cost}
                </div>
                {currentTool === tool.id && !isDisabled && <div className="tool-compact-badge">✓</div>}
              </div>
            );
          })}
        </div>

        {hoveredToolData && (
          <div className={`tool-detail-panel ${hoveredToolData.isSpecial ? 'special-panel' : ''}`}>
            <div className="tool-detail-title">{hoveredToolData.subtitle}</div>
            <p className="tool-detail-desc">{hoveredToolData.description}</p>
            <div className="tool-detail-section">
              <span className="tool-detail-label">THE SCIENCE:</span> {hoveredToolData.science}
            </div>
            <div className="tool-detail-section">
              <span className="tool-detail-label">THE RESULT:</span> {hoveredToolData.result}
            </div>
          </div>
        )}

        {!hoveredToolData && (
          <div className="tool-detail-panel tool-detail-hint">
            <p>Hover over a tool to see detailed information</p>
          </div>
        )}
      </div>
    </div>
  );
}
