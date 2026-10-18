import './compat.js';
import {hydrateStorage} from './platform.js';
import {attachGame,fallback} from './runtime.js';
hydrateStorage().then(()=>import('../src/town/main.js')).then(attachGame).catch(error=>{console.warn(error);fallback('小世界暂时无法加载');});
