export const LIMITS=Object.freeze({friendly:32,hostile:24,effects:48,texts:24,fields:3,summons:3});
// Friendly saturation must never erase an enemy attack already in flight.
export function trimFriendly(g){const friendly=g.projectiles.filter(p=>p.hostile===false);if(friendly.length>LIMITS.friendly){const remove=new Set(friendly.slice(0,friendly.length-LIMITS.friendly));g.projectiles=g.projectiles.filter(p=>!remove.has(p));}}
