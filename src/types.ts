/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Station = 'Stacking Blocks' | 'The Money Drop' | 'เกมบันไดงู' | 'all';

export type SoundCategory = 'Morning Game' | 'Afternoon Game' | 'System FX' | 'All SFX Assets';

export interface AudioTrack {
  id: string;
  title: string;
  fileName?: string;
  duration: string; // MM:SS format for display
  durationSeconds: number; // total duration in seconds
  url: string; // play URL
  station: Station; // target station
  category: SoundCategory; // sub-channel
  tags?: string[];
  isCustom?: boolean;
}
