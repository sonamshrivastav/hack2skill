import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, Wind, 
  BrainCircuit, Sparkles
} from 'lucide-react';

export default function Mindfulness({ geminiService, user }) {
  // --- 1. Box Breathing States ---
  const [breatheState, setBreatheState] = useState('PAUSED'); // PAUSED, INHALE, HOLD_IN, EXHALE, HOLD_OUT
  const [breatheTimer, setBreatheTimer] = useState(4);
  const breatheTimerRef = useRef(null);

  // --- 2. Web Audio States ---
  const [audioCtx, setAudioCtx] = useState(null);
  const [binauralActive, setBinauralActive] = useState(false);
  const [brownNoiseActive, setBrownNoiseActive] = useState(false);
  const [volume, setVolume] = useState(0.4);

  // Audio nodes references
  const binauralNodesRef = useRef(null);
  const brownNoiseNodesRef = useRef(null);
  const gainNodeRef = useRef(null);

  // --- 3. Cognitive Reframer States ---
  const [negativeThought, setNegativeThought] = useState('');
  const [reframedThought, setReframedThought] = useState('');
  const [isReframing, setIsReframing] = useState(false);

  // --- Box Breathing Logic ---
  useEffect(() => {
    if (breatheState === 'PAUSED') {
      if (breatheTimerRef.current) clearInterval(breatheTimerRef.current);
      return;
    }

    breatheTimerRef.current = setInterval(() => {
      setBreatheTimer((prev) => {
        if (prev <= 1) {
          // Switch state
          setBreatheState((curr) => {
            switch (curr) {
              case 'INHALE': return 'HOLD_IN';
              case 'HOLD_IN': return 'EXHALE';
              case 'EXHALE': return 'HOLD_OUT';
              case 'HOLD_OUT': return 'INHALE';
              default: return 'INHALE';
            }
          });
          return 4; // Reset to 4s
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (breatheTimerRef.current) clearInterval(breatheTimerRef.current);
    };
  }, [breatheState]);

  const toggleBreathing = () => {
    if (breatheState === 'PAUSED') {
      setBreatheState('INHALE');
      setBreatheTimer(4);
    } else {
      setBreatheState('PAUSED');
    }
  };

  const getBreatheLabel = () => {
    switch (breatheState) {
      case 'INHALE': return 'Breathe In';
      case 'HOLD_IN': return 'Hold Breath';
      case 'EXHALE': return 'Breathe Out';
      case 'HOLD_OUT': return 'Rest & Hold';
      default: return 'Ready?';
    }
  };

  const getCircleScale = () => {
    switch (breatheState) {
      case 'INHALE': return 1.6;
      case 'HOLD_IN': return 1.6;
      case 'EXHALE': return 1;
      case 'HOLD_OUT': return 1;
      default: return 1.1;
    }
  };

  const getCircleColor = () => {
    switch (breatheState) {
      case 'INHALE': return 'var(--color-accent-teal)';
      case 'HOLD_IN': return 'var(--color-accent-amber)';
      case 'EXHALE': return 'var(--color-accent-blue)';
      case 'HOLD_OUT': return 'var(--color-primary)';
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  };

  // --- Web Audio Synth Engines ---
  const initAudio = () => {
    if (audioCtx) return audioCtx;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(volume, ctx.currentTime);
    mainGain.connect(ctx.destination);
    
    gainNodeRef.current = mainGain;
    setAudioCtx(ctx);
    return ctx;
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtx) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtx.currentTime);
    }
  }, [volume, audioCtx]);

  // Clean up AudioContext & Nodes on unmount
  useEffect(() => {
    return () => {
      if (binauralNodesRef.current) stopBinaural();
      if (brownNoiseNodesRef.current) stopBrownNoise();
      
      // Prevent Audio Context memory leaks
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };
  }, [audioCtx]);

  // 1. Binaural Beats (100Hz Left, 110Hz Right -> 10Hz Alpha Focus Waves)
  const startBinaural = (ctx) => {
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    oscL.frequency.setValueAtTime(100, ctx.currentTime);
    oscR.frequency.setValueAtTime(110, ctx.currentTime);

    oscL.type = 'sine';
    oscR.type = 'sine';

    // Volume level for oscillator (keep low, binaural beats need comfort)
    const beatsGain = ctx.createGain();
    beatsGain.gain.setValueAtTime(0.35, ctx.currentTime);
    beatsGain.connect(gainNodeRef.current);

    if (pannerL && pannerR) {
      pannerL.pan.setValueAtTime(-1, ctx.currentTime);
      pannerR.pan.setValueAtTime(1, ctx.currentTime);
      oscL.connect(pannerL).connect(beatsGain);
      oscR.connect(pannerR).connect(beatsGain);
    } else {
      oscL.connect(beatsGain);
      oscR.connect(beatsGain);
    }

    oscL.start();
    oscR.start();

    binauralNodesRef.current = { oscL, oscR, beatsGain };
    setBinauralActive(true);
  };

  const stopBinaural = () => {
    if (binauralNodesRef.current) {
      try {
        binauralNodesRef.current.oscL.stop();
        binauralNodesRef.current.oscR.stop();
      } catch(e){}
      binauralNodesRef.current = null;
    }
    setBinauralActive(false);
  };

  const toggleBinaural = () => {
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();
    
    if (binauralActive) {
      stopBinaural();
    } else {
      startBinaural(ctx);
    }
  };

  // 2. Brown Noise Synthesizer (Mathematical DSP generation)
  const startBrownNoise = (ctx) => {
    const bufferSize = 10 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Volume boost
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, ctx.currentTime);
    noiseNode.connect(noiseGain).connect(gainNodeRef.current);
    
    noiseNode.start();

    brownNoiseNodesRef.current = { noiseNode, noiseGain };
    setBrownNoiseActive(true);
  };

  const stopBrownNoise = () => {
    if (brownNoiseNodesRef.current) {
      try {
        brownNoiseNodesRef.current.noiseNode.stop();
      } catch(e){}
      brownNoiseNodesRef.current = null;
    }
    setBrownNoiseActive(false);
  };

  const toggleBrownNoise = () => {
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();
    
    if (brownNoiseActive) {
      stopBrownNoise();
    } else {
      startBrownNoise(ctx);
    }
  };

  // --- Cognitive thought Reframer API/Simulator fallback ---
  const handleReframing = async () => {
    if (!negativeThought.trim()) return;
    setIsReframing(true);
    setReframedThought('');

    try {
      if (geminiService.ai) {
        const prompt = `
          You are a student mental wellness counselor specializing in cognitive reframing.
          The user has typed a negative, self-defeating exam-related thought.
          Convert this thought into a constructive, realistic, and positive growth-oriented mindset affirmation. Keep it short (1-2 sentences).
          
          Negative Thought:
          "${negativeThought}"
          
          Reframed Thought:
        `;
        const model = geminiService.ai.getGenerativeModel({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        const res = await model;
        setReframedThought(res.text());
      } else {
        await new Promise((resolve) => {
          setTimeout(() => {
            const lower = negativeThought.toLowerCase();
            let reframed = "This is a challenging path, but my capabilities grow with effort. A single exam score does not define my future potential.";
            
            if (lower.includes('fail')) {
              reframed = "Mock papers and exams are measures of preparation areas, not of my core capability. Even if I struggle, I can learn, pivot, and succeed in life.";
            } else if (lower.includes('compare') || lower.includes('better') || lower.includes('behind')) {
              reframed = "I am running my own race. Comparing my step 10 to someone else's step 50 is unfair. I will focus only on improving my daily revision targets.";
            } else if (lower.includes('tired') || lower.includes('give up') || lower.includes('cannot do')) {
              reframed = "Mental tiredness is a message to take rest, not to quit. Taking a break is part of strategic exam success, and I will resume with fresh energy.";
            }
            resolve(reframed);
          }, 1000);
        }).then(res => setReframedThought(res));
      }
    } catch(err) {
      setReframedThought("I can take this one step at a time. Difficult concepts take practice, and my persistence will help me figure them out.");
    } finally {
      setIsReframing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '4px' }}>Mindfulness Toolkit</h1>
        <p style={{ color: 'var(--text-muted)' }}>Calming exercises and local audio oscillators designed to reduce high-stakes exam anxiety.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Box Breathing Visualizer */}
        <div className="glass-panel" style={{ 
          padding: '28px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          minHeight: '380px'
        }}>
          <h2 style={{ fontSize: '1.2rem', color: '#fff', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Wind size={20} style={{ color: 'var(--color-accent-teal)' }} /> 4-4-4-4 Box Breathing Guide
          </h2>

          {/* Breathing bubble */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            width: '100%'
          }}>
            <div 
              aria-live="polite"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: getCircleColor(),
                boxShadow: `0 0 30px ${getCircleColor()}`,
                transform: `scale(${getCircleScale()})`,
                transition: 'transform 4s linear, background-color 1s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {breatheState === 'PAUSED' ? 'Ready' : breatheTimer}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '12px 0' }}>
            <h4 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '4px' }}>{getBreatheLabel()}</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {breatheState === 'PAUSED' ? 'Press Play to begin calming your autonomic nervous system.' : 'Follow the guide circle instructions.'}
            </p>
          </div>

          <button 
            onClick={toggleBreathing} 
            className="btn-primary" 
            aria-label={breatheState !== 'PAUSED' ? "Pause Box Breathing cycle" : "Start Box Breathing cycle"}
            style={{ 
              borderRadius: '50px', 
              padding: '12px 30px',
              background: breatheState !== 'PAUSED' ? 'var(--color-accent-rose)' : 'linear-gradient(135deg, var(--color-accent-teal) 0%, hsl(175, 80%, 40%) 100%)',
              boxShadow: breatheState !== 'PAUSED' ? '0 4px 15px var(--color-accent-rose-glow)' : '0 4px 15px var(--color-accent-teal-glow)'
            }}
          >
            {breatheState !== 'PAUSED' ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start Cycle</>}
          </button>
        </div>

        {/* Ambient Soundscape Synth (Web Audio API) */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Volume2 size={20} style={{ color: 'var(--color-accent-blue)' }} /> Ambient Soundscape Mixer
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '24px' }}>
              Local binaural beats (Alpha/Delta wave shift) and synthesized brown noise to mask exam preparation distraction.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Binaural Beat Synth */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: 'rgba(255,255,255,0.02)', 
                padding: '14px 18px', 
                borderRadius: '12px',
                border: '1px solid var(--border-glow)' 
              }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', color: '#fff' }}>Binaural Beats (Alpha Wave 10Hz)</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Calms racing thoughts, aids logic retention.</p>
                </div>
                <button 
                  onClick={toggleBinaural} 
                  aria-label={binauralActive ? "Stop Binaural Beats Alpha Wave generator" : "Start Binaural Beats Alpha Wave generator"}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: binauralActive ? 'var(--color-accent-blue)' : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {binauralActive ? 'ACTIVE' : 'START'}
                </button>
              </div>

              {/* Brown Noise Synth */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: 'rgba(255,255,255,0.02)', 
                padding: '14px 18px', 
                borderRadius: '12px',
                border: '1px solid var(--border-glow)' 
              }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', color: '#fff' }}>Synthesized Brown Noise</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>A deep, comforting drone that blocks out household noise.</p>
                </div>
                <button 
                  onClick={toggleBrownNoise} 
                  aria-label={brownNoiseActive ? "Stop Synthesized Brown Noise generator" : "Start Synthesized Brown Noise generator"}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: brownNoiseActive ? 'var(--color-accent-teal)' : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {brownNoiseActive ? 'ACTIVE' : 'START'}
                </button>
              </div>

            </div>
          </div>

          {/* Volume Control */}
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-glow)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <label htmlFor="mindfulness-master-volume" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Volume2 size={12} /> Master Volume</label>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input 
              id="mindfulness-master-volume"
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--color-accent-blue)',
                background: 'rgba(255,255,255,0.1)',
                height: '4px',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            />
          </div>

        </div>

      </div>

      {/* Cognitive Reframing Sandbox */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <BrainCircuit size={20} style={{ color: 'var(--color-primary)' }} /> Cognitive Thought Reframing Sandbox
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '20px' }}>
          Enter a stressful, anxious, or self-defeating prep thought. Let the AI filter transform it into a healthy, constructive growth affirmation.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Input side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label htmlFor="mindfulness-reframer-input" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' }}>Self defeating thoughts</label>
            <textarea
              id="mindfulness-reframer-input"
              value={negativeThought}
              onChange={(e) => setNegativeThought(e.target.value)}
              placeholder="e.g. 'I will definitely fail JEE mock tomorrow, my classmates are getting double my score. I am hopeless.'"
              style={{
                width: '100%',
                height: '110px',
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid var(--border-glow)',
                borderRadius: '10px',
                padding: '12px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                lineHeight: '1.45',
                resize: 'none',
                outline: 'none'
              }}
            />
            <button
              onClick={handleReframing}
              className="btn-primary"
              aria-label="Filter and reframe negative thoughts"
              style={{ 
                alignSelf: 'flex-start',
                padding: '8px 18px',
                fontSize: '0.85rem',
                opacity: (!negativeThought.trim() || isReframing) ? 0.6 : 1,
                cursor: (!negativeThought.trim() || isReframing) ? 'not-allowed' : 'pointer'
              }}
              disabled={!negativeThought.trim() || isReframing}
            >
              {isReframing ? 'Filtering Thought...' : <><Sparkles size={14} /> Filter & Reframe</>}
            </button>
          </div>

          {/* Output side */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-glow)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '140px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              fontSize: '0.7rem',
              color: 'var(--color-primary)',
              fontWeight: 'bold',
              background: 'rgba(138, 43, 226, 0.1)',
              padding: '2px 8px',
              borderRadius: '8px'
            }}>
              Reframed Mindset
            </div>

            {reframedThought ? (
              <p className="animate-fade-in" style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.5', paddingRight: '20px' }}>
                {reframedThought}
              </p>
            ) : (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', fontStyle: 'italic', textAlign: 'center' }}>
                Type a self-doubt thought on the left and click filter to re-contextualize your perspective.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
