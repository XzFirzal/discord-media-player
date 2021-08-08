/**
 * https://ffmpeg.org/ffmpeg-filters.html#Audio-Filters
 * 
 * { filterName: "filterValue" }
 * 
 * Leave "filterValue" as blank "", if no value
 */
export interface Filters {
  acompressor?: string
  aconstrast?: string
  acrossfade?: string
  acrossover?: string
  acrusher?: string
  adeclick?: string
  adeclip?: string
  adelay?: string
  adenorm?: string
  aecho?: string
  aemphasis?: string
  aexciter?: string
  afade?: string
  afftdn?: string
  afftfilt?: string
  afir?: string
  afreqshift?: string
  agate?: string
  aiir?: string
  allpass?: string
  anequalizer?: string
  anlmdn?: string
  apad?: string
  aphaser?: string
  aphaseshift?: string
  apulsator?: string
  aresample?: string
  arnndn?: string
  asetnsamples?: string
  asetrate?: string
  asoftclip?: string
  asubbost?: string
  asubcut?: string
  asupercut?: string
  asuperpass?: string
  asuperstop?: string
  atempo?: string
  bandpass?: string
  bandreject?: string
  bass?: string
  biquad?: string
  chorus?: string
  compand?: string
  compensationdelay?: string
  crossfeed?: string
  crystalizer?: string
  dcshift?: string
  deesser?: string
  dynaudnorm?: string
  earwax?: string
  equalizer?: string
  extrastereo?: string
  firequalizer?: string
  flanger?: string
  haas?: string
  headphone?: string
  highpass?: string
  highshelf?: string
  loudnorm?: string
  lowpass?: string
  lowshelf?: string
  mcompand?: string
  silenceremove?: string
  speechnorm?: string
  stereowiden?: string
  superequalizer?: string
  surround?: string
  treble?: string
  vibrato?: string
}