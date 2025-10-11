"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Motion = motion;
export const Presence = AnimatePresence;

export default function FramerWrapper({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
