"use client";

import dynamic from "next/dynamic";

// Keep the tool registry cheap for articles and tool-detail routes. Importing
// every interactive component directly made every page download the complete
// tool library, even when it rendered only one tool (or none at all).
//
// These dynamic boundaries preserve server rendering for the selected tool,
// while the browser downloads only that tool's client chunk.
export const NameInBinary = dynamic(() => import("./NameInBinary"));
export const CaesarCipher = dynamic(() => import("./CaesarCipher"));
export const TowerOfHanoi = dynamic(() => import("./TowerOfHanoi"));
export const SpinActivity = dynamic(() => import("./SpinActivity"));
export const FractionVisualizer = dynamic(() => import("./FractionVisualizer"));
export const MultiplicationVisualizer = dynamic(() => import("./MultiplicationVisualizer"));
export const FindBirthdayInPi = dynamic(() => import("./FindBirthdayInPi"));
export const MorseCode = dynamic(() => import("./MorseCode"));
export const ClockTool = dynamic(() => import("./ClockTool"));
export const DevelopmentalLeaps = dynamic(() => import("./DevelopmentalLeaps"));
export const PatternMaker = dynamic(() => import("./PatternMaker"));
export const ColorMixer = dynamic(() => import("./ColorMixer"));
export const NumberSystems = dynamic(() => import("./NumberSystems"));
export const WeightOnPlanets = dynamic(() => import("./WeightOnPlanets"));
export const PrimeExplorer = dynamic(() => import("./PrimeExplorer"));
export const GuessMyNumber = dynamic(() => import("./GuessMyNumber"));
export const TrussTester = dynamic(() => import("./TrussTester"));
