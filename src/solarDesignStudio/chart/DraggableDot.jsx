import React from 'react';

const DraggableDot = ({ cx, cy, payload, index, updateData, dragging, setDragging }) => {
  const handlePointerDown = (e) => {
    // Prevent default behavior to avoid conflicts with chart interactions.
    e.preventDefault();
    // Capture the pointer so that further events are directed here.
    e.target.setPointerCapture(e.pointerId);
    const initialDragState = { index, startY: e.clientY, initialValue: payload.kwh };
    setDragging(initialDragState);
  };

  const handlePointerMove = (e) => {
    if (dragging && dragging.index === index) {
      const delta = e.clientY - dragging.startY;
      const scalingFactor = 0.2; // Adjust sensitivity as needed
      let newValue = dragging.initialValue - delta * scalingFactor;
      newValue = Math.max(0, newValue);
      updateData(index, newValue);
    }
  };

  const handlePointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
    setDragging(null);
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
