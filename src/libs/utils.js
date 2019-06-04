export const restrictDouble = v => {
    v = String(v);
    const pattern = /\D/g;
    const indexOfPoint = v.indexOf('.');
    if(indexOfPoint > -1) {// now point at start allowed
        const parts = [v.slice(0, indexOfPoint), v.slice(indexOfPoint + 1)];
        return parts.map(p => p.replace(pattern, '')).join('.');
    } else {
        return v.replace(pattern, '');
    }
};