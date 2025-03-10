// gradientColors.js
import React from "react";

export const GradientColors = () => (
  <defs>
    {/* Voltage gradients */}
    <linearGradient id="gradientL1_voltage" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(0, 102, 255)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(0, 102, 255)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL2_voltage" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(51, 153, 255)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(51, 153, 255)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL3_voltage" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(102, 204, 255)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(102, 204, 255)" stopOpacity={0.2} />
    </linearGradient>

    {/* Current gradients */}
    <linearGradient id="gradientL1_current" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(255, 153, 0)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(255, 153, 0)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL2_current" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(255, 204, 51)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(255, 204, 51)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL3_current" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(255, 255, 102)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(255, 255, 102)" stopOpacity={0.2} />
    </linearGradient>

    {/* Frequency gradients */}
    <linearGradient id="gradientL1_frequency" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(0, 153, 76)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(0, 153, 76)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL2_frequency" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(51, 204, 102)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(51, 204, 102)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL3_frequency" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(102, 255, 153)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(102, 255, 153)" stopOpacity={0.2} />
    </linearGradient>

    {/* Voltage Harmonics gradients */}
    <linearGradient id="gradientL1_volt_harmonic" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(255, 99, 71)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(255, 99, 71)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL2_volt_harmonic" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(255, 140, 0)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(255, 140, 0)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL3_volt_harmonic" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(255, 69, 0)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(255, 69, 0)" stopOpacity={0.2} />
    </linearGradient>

    {/* Current Harmonics gradients */}
    <linearGradient id="gradientL1_curr_harmonic" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(0, 206, 209)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(0, 206, 209)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL2_curr_harmonic" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(72, 209, 204)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(72, 209, 204)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL3_curr_harmonic" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(32, 178, 170)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(32, 178, 170)" stopOpacity={0.2} />
    </linearGradient>

    {/* Power Factor gradients */}
    <linearGradient id="gradientL1_power_factor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(128, 128, 128)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(128, 128, 128)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL2_power_factor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(169, 169, 169)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(169, 169, 169)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL3_power_factor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(192, 192, 192)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(192, 192, 192)" stopOpacity={0.2} />
    </linearGradient>

    {/* Power gradients */}
    <linearGradient id="gradientL1_power" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(255, 0, 0)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(255, 0, 0)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL2_power" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(255, 69, 0)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(255, 69, 0)" stopOpacity={0.2} />
    </linearGradient>
    <linearGradient id="gradientL3_power" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(255, 140, 0)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(255, 140, 0)" stopOpacity={0.2} />
    </linearGradient>

    {/* Total Power gradient */}
    <linearGradient id="gradient_total_power" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="rgb(255, 165, 0)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="rgb(255, 165, 0)" stopOpacity={0.2} />
    </linearGradient>
  </defs>
);

export default GradientColors;
