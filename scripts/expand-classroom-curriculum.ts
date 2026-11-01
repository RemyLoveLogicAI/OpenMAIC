import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { validateScene } from '../packages/@openmaic/dsl/dist/index.js';
import { generateTTS } from '@/lib/audio/tts-providers';
import { DEFAULT_TTS_VOICES, DEFAULT_TTS_MODELS } from '@/lib/audio/constants';
import { writeJsonFileAtomic } from '@/lib/server/classroom-storage';

const CLASSROOM_ID = process.env.CLASSROOM_ID || process.argv[2] || 'TJ0q3IsuaR';
const CLASSROOM_FILE = path.join(process.cwd(), 'data', 'classrooms', `${CLASSROOM_ID}.json`);
const AUDIO_DIR = path.join(process.cwd(), 'data', 'classrooms', CLASSROOM_ID, 'audio');

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildScene6() {
  return {
    id: 'scene_cia_matrix_06',
    stageId: CLASSROOM_ID,
    title: 'The CIA Elicitation Matrix: Active Elicitation Tactics',
    order: 6,
    outlineId: 'scene_6',
    type: 'slide',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: {
      type: 'slide',
      canvas: {
        id: 'canvas_s6_matrix',
        viewportSize: 1000,
        viewportRatio: 0.5625,
        theme: {
          backgroundColor: '#ffffff',
          themeColors: ['#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#4472c4'],
          fontColor: '#333333',
          fontName: 'Microsoft YaHei',
          outline: { color: '#d14424', width: 2, style: 'solid' },
          shadow: { h: 0, v: 0, blur: 10, color: '#000000' },
        },
        elements: [
          {
            id: 'text_s6_title',
            type: 'text',
            left: 60,
            top: 36,
            width: 880,
            height: 48,
            content: '<p style="font-size: 28px; line-height: 1.2;"><strong>The CIA Elicitation Matrix: Active Elicitation Tactics</strong></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#1e293b',
            rotate: 0,
          },
          {
            id: 'text_s6_subtitle',
            type: 'text',
            left: 60,
            top: 86,
            width: 880,
            height: 28,
            content: '<p style="font-size: 15px; color: #475569;">Extracting protected intelligence through conversational reflex traps without direct questioning.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#475569',
            rotate: 0,
          },
          {
            id: 'shape_s6_divider',
            type: 'shape',
            left: 60,
            top: 118,
            width: 880,
            height: 2,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#cbd5e1',
            fixedRatio: false,
            rotate: 0,
          },
          // Card 1
          {
            id: 'shape_s6_card1',
            type: 'shape',
            left: 60,
            top: 130,
            width: 276,
            height: 272,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#f8fafc',
            outline: { color: '#cbd5e1', width: 1, style: 'solid' },
            fixedRatio: false,
            rotate: 0,
          },
          {
            id: 'text_s6_c1_title',
            type: 'text',
            left: 75,
            top: 142,
            width: 246,
            height: 44,
            content: '<p style="font-size: 17px; color: #0f172a;"><strong>1. Provocation & Ego</strong></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#0f172a',
            rotate: 0,
          },
          {
            id: 'text_s6_c1_body',
            type: 'text',
            left: 75,
            top: 188,
            width: 246,
            height: 204,
            content: '<p style="font-size: 13px; line-height: 1.45; color: #334155;"><strong>Tactic:</strong> Questioning expertise or feigning disbelief.<br/><br/><strong>Psychological Lever:</strong> Human ego compulsively defends professional competence. Targets volunteer sensitive technical nuances simply to prove mastery.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#334155',
            rotate: 0,
          },
          // Card 2
          {
            id: 'shape_s6_card2',
            type: 'shape',
            left: 362,
            top: 130,
            width: 276,
            height: 272,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#f8fafc',
            outline: { color: '#cbd5e1', width: 1, style: 'solid' },
            fixedRatio: false,
            rotate: 0,
          },
          {
            id: 'text_s6_c2_title',
            type: 'text',
            left: 377,
            top: 142,
            width: 246,
            height: 44,
            content: '<p style="font-size: 17px; color: #0f172a;"><strong>2. Misestimation</strong></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#0f172a',
            rotate: 0,
          },
          {
            id: 'text_s6_c2_body',
            type: 'text',
            left: 377,
            top: 188,
            width: 246,
            height: 204,
            content: '<p style="font-size: 13px; line-height: 1.45; color: #334155;"><strong>Tactic:</strong> Stating incorrect statistics or erroneous facts.<br/><br/><strong>Psychological Lever:</strong> The reflex to correct misinformation is near-irresistible: <em>"No, we don\'t run 40 nodes, we deployed 128 clusters last Tuesday."</em></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#334155',
            rotate: 0,
          },
          // Card 3
          {
            id: 'shape_s6_card3',
            type: 'shape',
            left: 664,
            top: 130,
            width: 276,
            height: 272,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#f8fafc',
            outline: { color: '#cbd5e1', width: 1, style: 'solid' },
            fixedRatio: false,
            rotate: 0,
          },
          {
            id: 'text_s6_c3_title',
            type: 'text',
            left: 679,
            top: 142,
            width: 246,
            height: 44,
            content: '<p style="font-size: 17px; color: #0f172a;"><strong>3. Feigned Ignorance</strong></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#0f172a',
            rotate: 0,
          },
          {
            id: 'text_s6_c3_body',
            type: 'text',
            left: 679,
            top: 188,
            width: 246,
            height: 204,
            content: '<p style="font-size: 13px; line-height: 1.45; color: #334155;"><strong>Tactic:</strong> Portraying oneself as an earnest novice seeking mentorship.<br/><br/><strong>Psychological Lever:</strong> Defuses operational vigilance. The target adopts a pedagogical posture, generously unpacking proprietary architectures.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#334155',
            rotate: 0,
          },
          // Bottom Takeaway
          {
            id: 'shape_s6_footer',
            type: 'shape',
            left: 60,
            top: 414,
            width: 880,
            height: 116,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#eff6ff',
            outline: { color: '#93c5fd', width: 1, style: 'solid' },
            fixedRatio: false,
            rotate: 0,
          },
          {
            id: 'text_s6_takeaway',
            type: 'text',
            left: 80,
            top: 424,
            width: 840,
            height: 96,
            content: '<p style="font-size: 15px; color: #1e3a8a;"><strong>The Golden Rule of Elicitation:</strong> <em>People naturally rush to fill an emotional vacuum, correct errors, and assert authority.</em></p><p style="font-size: 13px; color: #1e40af; margin-top: 4px;">A disciplined intelligence collector never asks for classified data outright; they construct conversational triggers where the target voluntarily surrenders the critical link.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#1e3a8a',
            rotate: 0,
          },
        ],
        background: { type: 'solid', color: '#ffffff' },
      },
    },
    actions: [
      {
        id: 'action_s6_spk1',
        type: 'speech',
        text: 'Welcome to our deep dive into the CIA Elicitation Matrix. In field operations, intelligence collectors rarely interrogate subjects directly. Instead, they exploit conversational reflexes that cause targets to divulge protected data voluntarily.',
      },
      {
        id: 'action_s6_spot1',
        type: 'spotlight',
        elementId: 'text_s6_title',
      },
      {
        id: 'action_s6_spk2',
        type: 'speech',
        text: 'The matrix focuses on active elicitation tactics designed to bypass security consciousness. Let us examine the three most devastating vectors: Provocation, Deliberate Misestimation, and Feigned Ignorance.',
      },
      {
        id: 'action_s6_spot2',
        type: 'spotlight',
        elementId: 'text_s6_c1_title',
      },
      {
        id: 'action_s6_spk3',
        type: 'speech',
        text: 'First is Provocation and Ego Exploitation. When an operative challenges your competence or implies your system is outdated, human pride reflexively urges you to defend yourself. An engineer who would never leak a spec sheet might gladly reveal proprietary clock speeds just to prove their technical prowess.',
      },
      {
        id: 'action_s6_spot3',
        type: 'spotlight',
        elementId: 'text_s6_c2_title',
      },
      {
        id: 'action_s6_spk4',
        type: 'speech',
        text: 'Second is the False Statement and Deliberate Misestimation trap. A collector will deliberately lowball or misstate a metric, saying I heard your satellite downlink barely handles twenty gigabits. The natural instinct to correct inaccurate information triggers an immediate correction: Actually, we benchmarked at over one hundred gigabits last month.',
      },
      {
        id: 'action_s6_spot4',
        type: 'spotlight',
        elementId: 'text_s6_c3_title',
      },
      {
        id: 'action_s6_spk5',
        type: 'speech',
        text: 'Third is Feigned Ignorance paired with Flattery. By playing the naive student eager to learn from a master, the collector completely disarms your operational threat radar. When you step into the role of teacher, your security barriers collapse.',
      },
      {
        id: 'action_s6_spot5',
        type: 'spotlight',
        elementId: 'shape_s6_footer',
      },
      {
        id: 'action_s6_spk6',
        type: 'speech',
        text: 'Notice our operational rule at the bottom: People desperately want to correct errors and be recognized as authorities. That psychological reflex is the foundation of covert conversational collection.',
      },
      {
        id: 'action_s6_disc1',
        type: 'discussion',
        topic: 'How do we identify deliberate misestimation in live conversation?',
        prompt: 'Curious Mind asks: How can an operative differentiate between an innocent misunderstanding and a deliberate misestimation designed to elicit classified numbers?',
        agentId: 'default-4',
      },
      {
        id: 'action_s6_spk7',
        type: 'speech',
        text: 'As Curious Mind highlights, whenever someone states a specific, provocative factual error regarding your sensitive project, immediately treat it as an active elicitation probe. Do not correct the number; respond with generalities or mirror the inquiry back.',
      },
    ],
  };
}

function buildScene7() {
  return {
    id: 'scene_ericksonian_07',
    stageId: CLASSROOM_ID,
    title: 'Ericksonian Conversational Trance & Embedded Commands',
    order: 7,
    outlineId: 'scene_7',
    type: 'slide',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: {
      type: 'slide',
      canvas: {
        id: 'canvas_s7_trance',
        viewportSize: 1000,
        viewportRatio: 0.5625,
        theme: {
          backgroundColor: '#ffffff',
          themeColors: ['#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#4472c4'],
          fontColor: '#333333',
          fontName: 'Microsoft YaHei',
          outline: { color: '#d14424', width: 2, style: 'solid' },
          shadow: { h: 0, v: 0, blur: 10, color: '#000000' },
        },
        elements: [
          {
            id: 'text_s7_title',
            type: 'text',
            left: 60,
            top: 36,
            width: 880,
            height: 48,
            content: '<p style="font-size: 28px; line-height: 1.2;"><strong>Ericksonian Conversational Trance & Embedded Commands</strong></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#1e293b',
            rotate: 0,
          },
          {
            id: 'text_s7_subtitle',
            type: 'text',
            left: 60,
            top: 86,
            width: 880,
            height: 28,
            content: '<p style="font-size: 15px; color: #475569;">Sub-perceptual pacing, analog marking, and indirect hypnotic inductions in operational dialogue.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#475569',
            rotate: 0,
          },
          {
            id: 'shape_s7_divider',
            type: 'shape',
            left: 60,
            top: 118,
            width: 880,
            height: 2,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#cbd5e1',
            fixedRatio: false,
            rotate: 0,
          },
          // Card 1
          {
            id: 'shape_s7_card1',
            type: 'shape',
            left: 60,
            top: 130,
            width: 276,
            height: 272,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#f8fafc',
            outline: { color: '#cbd5e1', width: 1, style: 'solid' },
            fixedRatio: false,
            rotate: 0,
          },
          {
            id: 'text_s7_c1_title',
            type: 'text',
            left: 75,
            top: 142,
            width: 246,
            height: 44,
            content: '<p style="font-size: 17px; color: #0f172a;"><strong>1. Pacing & Leading</strong></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#0f172a',
            rotate: 0,
          },
          {
            id: 'text_s7_c1_body',
            type: 'text',
            left: 75,
            top: 188,
            width: 246,
            height: 204,
            content: '<p style="font-size: 13px; line-height: 1.45; color: #334155;"><strong>Technique:</strong> Synchronizing speech cadence, vocal timber, and sensory truisms.<br/><br/><strong>Hypnotic Principle:</strong> Once three consecutive verifiable statements are validated by the target\'s cognitive filter, the fourth statement—a behavioral lead—is adopted uncritically.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#334155',
            rotate: 0,
          },
          // Card 2
          {
            id: 'shape_s7_card2',
            type: 'shape',
            left: 362,
            top: 130,
            width: 276,
            height: 272,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#f8fafc',
            outline: { color: '#cbd5e1', width: 1, style: 'solid' },
            fixedRatio: false,
            rotate: 0,
          },
          {
            id: 'text_s7_c2_title',
            type: 'text',
            left: 377,
            top: 142,
            width: 246,
            height: 44,
            content: '<p style="font-size: 17px; color: #0f172a;"><strong>2. Analog Marking</strong></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#0f172a',
            rotate: 0,
          },
          {
            id: 'text_s7_c2_body',
            type: 'text',
            left: 377,
            top: 188,
            width: 246,
            height: 204,
            content: '<p style="font-size: 13px; line-height: 1.45; color: #334155;"><strong>Technique:</strong> Tonal pitch inflection, micro-pauses, or subtle gestures on specific keywords.<br/><br/><strong>Hypnotic Principle:</strong> The conscious mind hears a polite story, while the subconscious processes the marked syllables as an isolated imperative command.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#334155',
            rotate: 0,
          },
          // Card 3
          {
            id: 'shape_s7_card3',
            type: 'shape',
            left: 664,
            top: 130,
            width: 276,
            height: 272,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#f8fafc',
            outline: { color: '#cbd5e1', width: 1, style: 'solid' },
            fixedRatio: false,
            rotate: 0,
          },
          {
            id: 'text_s7_c3_title',
            type: 'text',
            left: 679,
            top: 142,
            width: 246,
            height: 44,
            content: '<p style="font-size: 17px; color: #0f172a;"><strong>3. Double Binds</strong></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#0f172a',
            rotate: 0,
          },
          {
            id: 'text_s7_c3_body',
            type: 'text',
            left: 679,
            top: 188,
            width: 246,
            height: 204,
            content: '<p style="font-size: 13px; line-height: 1.45; color: #334155;"><strong>Technique:</strong> Constructing choices where every alternative presupposes compliance.<br/><br/><strong>Hypnotic Principle:</strong> <em>"Would you prefer to debrief now or in twenty minutes?"</em> The subject expends cognitive effort choosing timing, unconsciously conceding the debrief itself.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#334155',
            rotate: 0,
          },
          // Bottom Takeaway
          {
            id: 'shape_s7_footer',
            type: 'shape',
            left: 60,
            top: 414,
            width: 880,
            height: 116,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#faf5ff',
            outline: { color: '#d8b4fe', width: 1, style: 'solid' },
            fixedRatio: false,
            rotate: 0,
          },
          {
            id: 'text_s7_takeaway',
            type: 'text',
            left: 80,
            top: 424,
            width: 840,
            height: 96,
            content: '<p style="font-size: 15px; color: #581c87;"><strong>Bypassing the Critical Factor:</strong> <em>Conversational trance is not somnambulism; it is focused internal absorption where peripheral scrutiny collapses.</em></p><p style="font-size: 13px; color: #6b21a8; margin-top: 4px;">Milton Erickson pioneered how ordinary conversations can weave suggestions into the mind so seamlessly that the subject firmly believes the decision was entirely their own.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#581c87',
            rotate: 0,
          },
        ],
        background: { type: 'solid', color: '#ffffff' },
      },
    },
    actions: [
      {
        id: 'action_s7_spk1',
        type: 'speech',
        text: 'Next, we explore Ericksonian Conversational Trance and Embedded Commands. Unlike theatrical hypnosis, operational trance occurs in ordinary, awake conversations without swinging pocket watches or deep sleep commands.',
      },
      {
        id: 'action_s7_spot1',
        type: 'spotlight',
        elementId: 'text_s7_title',
      },
      {
        id: 'action_s7_spk2',
        type: 'speech',
        text: 'Doctor Milton Erickson demonstrated that the critical barrier of the conscious mind can be bypassed by using indirect language, subtle vocal marking, and structured presuppositions.',
      },
      {
        id: 'action_s7_spot2',
        type: 'spotlight',
        elementId: 'text_s7_c1_title',
      },
      {
        id: 'action_s7_spk3',
        type: 'speech',
        text: 'Sub-perceptual Pacing and Leading begins by mirroring the target posture, breathing rate, and linguistic habits while stating undeniable facts. When an operative states three things you know to be true, your mind relaxes its defensive guards, allowing the fourth statement to lead your subsequent thoughts.',
      },
      {
        id: 'action_s7_spot3',
        type: 'spotlight',
        elementId: 'text_s7_c2_title',
      },
      {
        id: 'action_s7_spk4',
        type: 'speech',
        text: 'Analog Marking uses micro-tonal shifts or brief pauses to highlight embedded imperatives inside innocent sentences. For instance: As we consider this project, you may decide to share the encrypted logs freely, whenever you feel confident. The marked words form a direct command received beneath conscious processing.',
      },
      {
        id: 'action_s7_spot4',
        type: 'spotlight',
        elementId: 'text_s7_c3_title',
      },
      {
        id: 'action_s7_spk5',
        type: 'speech',
        text: 'Double Binds trap the target within an illusion of agency. When asked: Would you rather sign the disclosure agreement before lunch, or review it over dessert?, both choices accept the premise that you will sign. Your conscious mind debates timing while your defense against signing is disarmed.',
      },
      {
        id: 'action_s7_spot5',
        type: 'spotlight',
        elementId: 'shape_s7_footer',
      },
      {
        id: 'action_s7_spk6',
        type: 'speech',
        text: 'As summarized below, trance is heightened internal absorption. When you are absorbed in thinking about an interesting riddle or analogy, your peripheral operational alertness drops to near zero.',
      },
      {
        id: 'action_s7_disc1',
        type: 'discussion',
        topic: 'Can grounding interrupts break conversational trance?',
        prompt: 'Deep Thinker asks: If conversational trance depends on internal absorption and cadence matching, does deliberately introducing an unexpected physical motion or non-sequitur instantly break the spell?',
        agentId: 'default-6',
      },
      {
        id: 'action_s7_spk7',
        type: 'speech',
        text: 'Deep Thinker is spot on. Any sudden kinetic break, shifting your physical posture, or asking an unexpected question disrupts the influencer pacing cycle and snaps your cognitive filter right back online.',
      },
    ],
  };
}

function buildScene8() {
  return {
    id: 'scene_sanitization_08',
    stageId: CLASSROOM_ID,
    title: 'Cognitive Sanitization, Canary Traps & Operational Compartmentalization',
    order: 8,
    outlineId: 'scene_8',
    type: 'slide',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: {
      type: 'slide',
      canvas: {
        id: 'canvas_s8_defense',
        viewportSize: 1000,
        viewportRatio: 0.5625,
        theme: {
          backgroundColor: '#ffffff',
          themeColors: ['#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#4472c4'],
          fontColor: '#333333',
          fontName: 'Microsoft YaHei',
          outline: { color: '#d14424', width: 2, style: 'solid' },
          shadow: { h: 0, v: 0, blur: 10, color: '#000000' },
        },
        elements: [
          {
            id: 'text_s8_title',
            type: 'text',
            left: 60,
            top: 36,
            width: 880,
            height: 48,
            content: '<p style="font-size: 28px; line-height: 1.2;"><strong>Cognitive Sanitization & Canary Traps</strong></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#1e293b',
            rotate: 0,
          },
          {
            id: 'text_s8_subtitle',
            type: 'text',
            left: 60,
            top: 86,
            width: 880,
            height: 28,
            content: '<p style="font-size: 15px; color: #475569;">Counter-intelligence architectures, forensic information watermarking, and conversational judo.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#475569',
            rotate: 0,
          },
          {
            id: 'shape_s8_divider',
            type: 'shape',
            left: 60,
            top: 118,
            width: 880,
            height: 2,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#cbd5e1',
            fixedRatio: false,
            rotate: 0,
          },
          // Card 1
          {
            id: 'shape_s8_card1',
            type: 'shape',
            left: 60,
            top: 130,
            width: 276,
            height: 272,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#f8fafc',
            outline: { color: '#cbd5e1', width: 1, style: 'solid' },
            fixedRatio: false,
            rotate: 0,
          },
          {
            id: 'text_s8_c1_title',
            type: 'text',
            left: 75,
            top: 142,
            width: 246,
            height: 44,
            content: '<p style="font-size: 17px; color: #0f172a;"><strong>1. Compartmentalization</strong></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#0f172a',
            rotate: 0,
          },
          {
            id: 'text_s8_c1_body',
            type: 'text',
            left: 75,
            top: 188,
            width: 246,
            height: 204,
            content: '<p style="font-size: 13px; line-height: 1.45; color: #334155;"><strong>Doctrine:</strong> Zero-trust conversational hygiene. Strict compartmentalization of critical keys.<br/><br/><strong>Implementation:</strong> Sanitizing conversational surfaces so that even under compromised rapport, no individual operator possesses the cumulative puzzle pieces.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#334155',
            rotate: 0,
          },
          // Card 2
          {
            id: 'shape_s8_card2',
            type: 'shape',
            left: 362,
            top: 130,
            width: 276,
            height: 272,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#f8fafc',
            outline: { color: '#cbd5e1', width: 1, style: 'solid' },
            fixedRatio: false,
            rotate: 0,
          },
          {
            id: 'text_s8_c2_title',
            type: 'text',
            left: 377,
            top: 142,
            width: 246,
            height: 44,
            content: '<p style="font-size: 17px; color: #0f172a;"><strong>2. Canary Traps</strong></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#0f172a',
            rotate: 0,
          },
          {
            id: 'text_s8_c2_body',
            type: 'text',
            left: 377,
            top: 188,
            width: 246,
            height: 204,
            content: '<p style="font-size: 13px; line-height: 1.45; color: #334155;"><strong>Doctrine:</strong> Releasing controlled, subtly differing versions of sensitive briefings to distinct recipients.<br/><br/><strong>Implementation:</strong> When leaked intelligence emerges in adversary queries, the specific fingerprint isolates the leak point unequivocally.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#334155',
            rotate: 0,
          },
          // Card 3
          {
            id: 'shape_s8_card3',
            type: 'shape',
            left: 664,
            top: 130,
            width: 276,
            height: 272,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#f8fafc',
            outline: { color: '#cbd5e1', width: 1, style: 'solid' },
            fixedRatio: false,
            rotate: 0,
          },
          {
            id: 'text_s8_c3_title',
            type: 'text',
            left: 679,
            top: 142,
            width: 246,
            height: 44,
            content: '<p style="font-size: 17px; color: #0f172a;"><strong>3. Conversational Judo</strong></p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#0f172a',
            rotate: 0,
          },
          {
            id: 'text_s8_c3_body',
            type: 'text',
            left: 679,
            top: 188,
            width: 246,
            height: 204,
            content: '<p style="font-size: 13px; line-height: 1.45; color: #334155;"><strong>Doctrine:</strong> Rather than stonewalling, redirect the collector\'s force into harmless public channels.<br/><br/><strong>Implementation:</strong> Provide copious unclassified context with enthusiasm while using polite counter-questions to map the adversary\'s intelligence requirements.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#334155',
            rotate: 0,
          },
          // Bottom Takeaway
          {
            id: 'shape_s8_footer',
            type: 'shape',
            left: 60,
            top: 414,
            width: 880,
            height: 116,
            path: 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
            viewBox: [1, 1],
            fill: '#f0fdf4',
            outline: { color: '#86efac', width: 1, style: 'solid' },
            fixedRatio: false,
            rotate: 0,
          },
          {
            id: 'text_s8_takeaway',
            type: 'text',
            left: 80,
            top: 424,
            width: 840,
            height: 96,
            content: '<p style="font-size: 15px; color: #14532d;"><strong>The Counter-Intelligence Reversal:</strong> <em>Every elicitation attempt is a reconnaissance probe that leaks the adversary\'s targeting mandate.</em></p><p style="font-size: 13px; color: #166534; margin-top: 4px;">When you detect elicitation, don\'t show hostility. Act interested, deploy an unclassified decoy, and record exactly what the collector was probing for.</p>',
            defaultFontName: 'Microsoft YaHei',
            defaultColor: '#14532d',
            rotate: 0,
          },
        ],
        background: { type: 'solid', color: '#ffffff' },
      },
    },
    actions: [
      {
        id: 'action_s8_spk1',
        type: 'speech',
        text: 'In our eighth scene, we transition from individual defense to systemic counter-intelligence architecture: Cognitive Sanitization, Canary Traps, and Conversational Judo.',
      },
      {
        id: 'action_s8_spot1',
        type: 'spotlight',
        elementId: 'text_s8_title',
      },
      {
        id: 'action_s8_spk2',
        type: 'speech',
        text: 'The best defense against psychological manipulation is structural. Even if an operative experiences cognitive fatigue, compartmentalized protocols ensure no single conversation can compromise core security.',
      },
      {
        id: 'action_s8_spot2',
        type: 'spotlight',
        elementId: 'text_s8_c1_title',
      },
      {
        id: 'action_s8_spk3',
        type: 'speech',
        text: 'Operational Compartmentalization and Cognitive Sanitization require strict boundaries. You must actively sanitize your spoken vocabulary, omitting internal project code names, server environments, or supplier relationships from all casual social interactions.',
      },
      {
        id: 'action_s8_spot3',
        type: 'spotlight',
        elementId: 'text_s8_c2_title',
      },
      {
        id: 'action_s8_spk4',
        type: 'speech',
        text: 'A Canary Trap is the gold standard for detecting information leaks. By providing slightly different versions of a memo or date to suspect individuals, any subsequent disclosure carries an indelible forensic watermark pointing directly to the source.',
      },
      {
        id: 'action_s8_spot4',
        type: 'spotlight',
        elementId: 'text_s8_c3_title',
      },
      {
        id: 'action_s8_spk5',
        type: 'speech',
        text: 'Conversational Judo is the art of absorbing the collector probe and redirecting it harmlessly. Instead of clunky silence that signals you have a secret, share abundant, harmless public details enthusiastically, then pivot to question the origin of the inquiry.',
      },
      {
        id: 'action_s8_spot5',
        type: 'spotlight',
        elementId: 'shape_s8_footer',
      },
      {
        id: 'action_s8_spk6',
        type: 'speech',
        text: 'Remember the Counter-Intelligence Reversal: When an adversary probes you, they are giving away their collection priorities. Every question they ask reveals what their intelligence agency lacks.',
      },
      {
        id: 'action_s8_disc1',
        type: 'discussion',
        topic: 'Executing conversational judo under pressure',
        prompt: 'Note Taker asks: What is the cleanest practical phrase to redirect an aggressive inquiry without appearing uncooperative?',
        agentId: 'default-5',
      },
      {
        id: 'action_s8_spk7',
        type: 'speech',
        text: 'A masterclass phrase noted by Note Taker is: That is a compelling technical dilemma! We actually debated a similar public paper last quarter—what methodology does your team recommend for solving it? You validate their question, offer nothing sensitive, and turn the spotlight right back onto them.',
      },
    ],
  };
}

function buildScene9() {
  return {
    id: 'scene_red_team_09',
    stageId: CLASSROOM_ID,
    title: 'Red Team Tactical Simulation: Live Operational Scenario',
    order: 9,
    outlineId: 'scene_9',
    type: 'quiz',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: {
      type: 'quiz',
      questions: [
        {
          id: 'q_rt_1',
          type: 'single',
          question: 'Tactical Scenario 1: At an international technology conference, an unknown consultant casually strikes up a chat and says: "Your firm\'s new quantum encryption co-processor is rumored to suffer from fatal thermal throttling above eighty degrees—honestly, everyone knows your architecture is falling behind." Which elicitation tactic is active, and what is your optimal operational counter-measure?',
          options: [
            {
              value: 'A',
              label: 'Pattern Interrupt; abruptly change the topic to discuss the weather in Zurich.',
            },
            {
              value: 'B',
              label: 'Provocation & Deliberate Misestimation; execute Conversational Judo by validating the difficulty of thermal dissipation generally, without confirming or denying your architecture, and counter-probe their benchmarks.',
            },
            {
              value: 'C',
              label: 'Double Bind; quickly disclose your laboratory\'s verified heat test metrics to protect your team\'s reputation.',
            },
            {
              value: 'D',
              label: 'Ericksonian Anchoring; immediately demand to see their conference security clearance badge.',
            },
          ],
          answer: ['B'],
          analysis: 'The speaker uses Provocation and Deliberate Misestimation to trigger your ego into defending your engineering credentials. The correct response is Conversational Judo: deflect the provocation by discussing general industry thermal physics, never confirm internal metrics, and politely probe their perspective to understand who sent them.',
          points: 30,
          hasAnswer: true,
        },
        {
          id: 'q_rt_2',
          type: 'multiple',
          question: 'Tactical Scenario 2: During a cross-departmental strategy review, an external auditor sits beside you, matches your breathing cadence, softens their tone, and says: "As we review these deployment schedules today, you can comfortably release the production credentials now, or would it be more convenient to send the authentication tokens after lunch?" Select all psychological and hypnotic mechanisms active in this query:',
          options: [
            {
              value: 'A',
              label: 'Sub-perceptual pacing (mirroring breathing rhythm, posture, and vocal tempo).',
            },
            {
              value: 'B',
              label: 'Double bind (offering a false choice between "now" and "after lunch", presupposing compliance in releasing credentials).',
            },
            {
              value: 'C',
              label: 'Analog marking / Embedded command ("comfortably release the production credentials").',
            },
            {
              value: 'D',
              label: 'Overt physical duress and hostile interrogation.',
            },
          ],
          answer: ['A', 'B', 'C'],
          analysis: 'The auditor is employing Ericksonian pacing (matching breathing and vocal tone), an embedded command with analog vocal marking ("comfortably release the production credentials"), and a double bind (framing the choice purely around timing, which presupposes the unauthorized release of credentials). Option D is incorrect as this is entirely covert.',
          points: 35,
          hasAnswer: true,
        },
        {
          id: 'q_rt_3',
          type: 'short_answer',
          question: 'Tactical Scenario 3: Counter-Intelligence Execution. You suspect that confidential release dates from your internal executive council are being leaked to an external competitor. Describe how you would formulate and deploy a "Canary Trap" across the four council directors to forensically pinpoint the leak source without alerting the suspected mole.',
          commentPrompt: 'Grading Rubric: (1) Formulation of subtle, plausible informational variances (watermarks) across documents - 40% (2) Strict isolated distribution to each director with zero cross-contamination - 40% (3) Covert monitoring and leak attribution protocol - 20%',
          analysis: 'To execute the Canary Trap: 1. Generate four subtly differentiated copies of the release schedule, each with a unique, plausible variation (e.g., varying release dates by several days or using distinct project codenames like Apex, Titan, Zenith, and Vanguard). 2. Distribute one unique version exclusively to each director under isolated channels, ensuring document metadata and access logs are tightly secured. 3. Monitor external competitor communications or press leaks. When a specific date or codename surfaces, the unique watermark definitively identifies which director leaked the material without arousing premature suspicion.',
          points: 35,
          hasAnswer: false,
        },
      ],
    },
    actions: [
      {
        id: 'action_s9_spk1',
        type: 'speech',
        text: 'Welcome to the Red Team Tactical Simulation. You are now in an active operational environment facing live elicitation and covert influence vectors. Evaluate each operational scenario, identify the underlying manipulation technique, and execute the correct counter-measure. Proceed with precision.',
      },
    ],
  };
}

async function main() {
  console.log(`[Classroom Expand] Loading ${CLASSROOM_FILE}`);
  const raw = fs.readFileSync(CLASSROOM_FILE, 'utf-8');
  const classroom = JSON.parse(raw);

  const existingScenes = classroom.scenes.slice(0, 5);
  const newScenes = [buildScene6(), buildScene7(), buildScene8(), buildScene9()];

  // Validate all new scenes
  for (const scene of newScenes) {
    const valid = validateScene(scene as any);
    if (!valid.valid) {
      console.error(`Validation error on ${scene.title}:`, valid.errors);
      throw new Error(`Scene validation failed for ${scene.title}`);
    }
  }
  console.log('[Classroom Expand] All 4 new scenes passed validateScene()!');

  classroom.scenes = [...existingScenes, ...newScenes];

  // Synthesize speech
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY missing');

  const voice = DEFAULT_TTS_VOICES['elevenlabs-tts'];
  const modelId = DEFAULT_TTS_MODELS['elevenlabs-tts'];
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  let totalActions = 0;
  let synthesizedCount = 0;
  let reusedCount = 0;

  for (const scene of classroom.scenes) {
    const sceneOrder = scene.order;
    for (const action of scene.actions || []) {
      if (action.type !== 'speech' || !action.text) continue;
      totalActions++;
      const audioId = `tts_s${sceneOrder}_${action.id}`;
      const filename = `${audioId}.mp3`;
      const filePath = path.join(AUDIO_DIR, filename);
      const audioUrl = `/api/classroom-media/${CLASSROOM_ID}/audio/${filename}`;

      let hasValidFile = false;
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > 100) {
          hasValidFile = true;
          reusedCount++;
          console.log(`[Reused] Scene ${sceneOrder} Action ${action.id} -> ${filename} (${stats.size} bytes)`);
        }
      }

      if (!hasValidFile) {
        console.log(`[Synthesizing ${totalActions}] Scene ${sceneOrder} Action ${action.id}: "${action.text.slice(0, 50)}..."`);
        let audioBytes: Buffer | null = null;
        try {
          const result = await generateTTS(
            {
              providerId: 'elevenlabs-tts',
              apiKey,
              modelId,
              voice,
            },
            action.text,
          );
          audioBytes = Buffer.from(result.audio);
          console.log(`[Done via ElevenLabs] Written ${filename} (${audioBytes.byteLength} bytes)`);
        } catch (err: any) {
          console.warn(`[ElevenLabs Quota/Error] ${err?.message || err}. Falling back to Deepgram Aura TTS...`);
          const deepgramKey = process.env.DEEPGRAM_API_KEY || '87befcd485c1ada8b129e6a3e472f5f83ec112f5';
          const dgResp = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
            method: 'POST',
            headers: {
              Authorization: `Token ${deepgramKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: action.text }),
          });
          if (!dgResp.ok) {
            throw new Error(`Deepgram fallback failed: ${dgResp.status} ${await dgResp.text()}`);
          }
          const buf = await dgResp.arrayBuffer();
          audioBytes = Buffer.from(buf);
          console.log(`[Done via Deepgram Aura] Written ${filename} (${audioBytes.byteLength} bytes)`);
        }

        fs.writeFileSync(filePath, audioBytes);
        synthesizedCount++;
        await sleep(250);
      }

      action.audioId = audioId;
      action.audioUrl = audioUrl;
    }
  }

  console.log(`[Classroom Expand] Total: ${totalActions}, Synthesized: ${synthesizedCount}, Reused: ${reusedCount}`);

  // Write updated JSON
  console.log(`[Classroom Expand] Writing updated JSON to ${CLASSROOM_FILE}`);
  await writeJsonFileAtomic(CLASSROOM_FILE, classroom);

  // Sync to PostgreSQL
  const dbUrl = process.env.DATABASE_URL || 'postgres://openmaic:openmaic-dev@127.0.0.1:5433/openmaic';
  console.log('[Classroom Expand] Updating PostgreSQL database records...');
  const pool = new Pool({ connectionString: dbUrl });
  try {
    for (const scene of classroom.scenes) {
      const res = await pool.query(
        `INSERT INTO document_scenes (stage_id, id, scene_order, data)
         VALUES ($1, $2, $4, $3::jsonb)
         ON CONFLICT (stage_id, id)
         DO UPDATE SET data = EXCLUDED.data, scene_order = EXCLUDED.scene_order`,
        [CLASSROOM_ID, scene.id, JSON.stringify(scene), scene.order],
      );
      console.log(`[DB] Upserted document_scenes ${scene.id} (order ${scene.order}): ${res.rowCount} row(s) updated`);
    }

    const metaRes = await pool.query(
      `UPDATE stage_meta
       SET is_public = true, generation_complete = true
       WHERE stage_id = $1`,
      [CLASSROOM_ID],
    );
    console.log(`[DB] Updated stage_meta: ${metaRes.rowCount} row(s) updated`);
  } finally {
    await pool.end();
  }

  console.log('[Classroom Expand] Expansion and synchronization successfully completed!');
}

main().catch((err) => {
  console.error('[Classroom Expand] Error:', err);
  process.exit(1);
});
