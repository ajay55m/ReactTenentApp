// Captcha.js
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import Svg, { Rect, Text as SvgText, Line, Circle, G } from "react-native-svg";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function generateCaptchaText(length = 5) {
  let s = "";
  for (let i = 0; i < length; i++) s += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  return s;
}

export default function Captcha({ width = 290, height = 70, length = 5, onChange = () => {}, seed }) {
  // seed prop forces regeneration when changed (use Date.now() from parent)
  const [localSeed, setLocalSeed] = useState(seed || Date.now());
  useEffect(() => { if (seed) setLocalSeed(seed); }, [seed]);

  const captcha = useMemo(() => generateCaptchaText(length), [localSeed, length]);
  useEffect(() => onChange(captcha), [captcha, onChange]);

  const charData = useMemo(() => {
    const items = [];
    const paddingX = 12;
    const spacing = (width - paddingX * 2) / length;
    for (let i = 0; i < captcha.length; i++) {
      const x = paddingX + spacing * i + spacing / 2;
      const y = height / 2 + rand(-6, 6);
      items.push({ char: captcha[i], x, y, fontSize: rand(22, 34), angle: rand(-30, 30), fill: `rgb(${rand(10,100)},${rand(10,100)},${rand(10,100)})` });
    }
    return items;
  }, [captcha, width, height, length]);

  const noise = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 4; i++) {
      lines.push({
        x1: rand(0, width), y1: rand(0, height), x2: rand(0, width), y2: rand(0, height),
        stroke: `rgba(${rand(0,255)},${rand(0,255)},${rand(0,255)},${(rand(2,6)/10).toFixed(2)})`,
        strokeWidth: Math.random() * 2 + 0.6,
      });
    }
    const dots = [];
    for (let i = 0; i < 30; i++) {
      dots.push({ cx: rand(0, width), cy: rand(0, height), r: Math.random()*1.8 + 0.6, fill: `rgba(0,0,0,${(rand(1,6)/10).toFixed(2)})` });
    }
    return { lines, dots };
  }, [localSeed, width, height]);

  const refresh = useCallback(() => setLocalSeed(Date.now()), []);
  return (
    <View style={styles.container}>
      <Svg width={width} height={height} style={styles.svg}>
        <Rect x="0" y="0" width={width} height={height} rx="10" fill="#ffffff" stroke="#e6e6e6" strokeWidth="1" />
        {noise.lines.map((l, idx) => <Line key={idx} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.stroke} strokeWidth={l.strokeWidth} strokeLinecap="round" />)}
        {charData.map((c, i) => (
          <G key={i} transform={`translate(${c.x}, ${c.y}) rotate(${c.angle})`}>
            <SvgText fontSize={c.fontSize} fontWeight="700" fill={c.fill} textAnchor="middle" alignmentBaseline="middle">{c.char}</SvgText>
          </G>
        ))}
        {noise.dots.map((d, i) => <Circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />)}
      </Svg>

      <View style={styles.row}>
        <TouchableOpacity onPress={refresh} style={styles.refreshBtn}><Text style={styles.refreshText}>↻</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  svg: { alignSelf: "center", marginBottom: 10, borderRadius: 10 },
  row: { flexDirection: "row", justifyContent: "flex-end" },
  refreshBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#f3f3f3", borderRadius: 8 },
  refreshText: { fontSize: 18 },
});
