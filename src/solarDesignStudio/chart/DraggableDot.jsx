import React from 'react';

const DraggableDot = ({ cx, cy, payload, index, updateData, dragging, setDragging }) => {
  const handlePointerDown = (e) => {
    e.preventDefault();
    console.log('Pointer down on dot at index:', index);
    e.target.setPointerCapture(e.pointerId);
    const initialDragState = { index, startY: e.clientY, initialValue: payload.kwh };
    setDragging(initialDragState);
    // Attach move and up events to the window
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };
  
  const handlePointerMove = (e) => {
    if (dragging && dragging.index === index) {
      const delta = e.clientY - dragging.startY;
      const scalingFactor = 0.1; // Adjust sensitivity as needed
      let newValue = dragging.initialValue - delta * scalingFactor;
      newValue = Math.max(0, newValue);
      updateData(index, newValue);
    }
  };
  
  const handlePointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
    setDragging(null);
    // Remove global event listeners when the pointer is released
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };
  

  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      stroke="#36A2EB"
      strokeWidth={2}
      fill="#fff"
      style={{ cursor: 'ns-resize' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
};

export default DraggableDot;
