/**
 * trajectory-clean: 简洁直观的轨迹视图
 *
 * 在会话顶部添加"轨迹"标签页，按用户消息分组展示完整对话历史，
 * 每条消息显示类型标签、摘要、Token 消耗，点击展开详情。
 * 支持加载更早记录，适配所有主题，差异化展示用户/模型/工具。
 * 无 emoji，无装饰性 AI 元素。
 */
import React from 'react'

export const inject = ['timer']

export function apply(ctx) {
  const slots = ctx.get('slots')
  if (slots === undefined) return

  const style = document.createElement('style')
  style.textContent = `
.tc { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', 'PingFang SC', sans-serif; font-size: 14px; line-height: 1.6; color: var(--dsw-alias-label-primary, #1a1a2e); max-width: 100%; position: relative; }
.tc-summary { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 20px; padding: 10px 20px; background: var(--dsw-alias-bg-base, #fff); border-bottom: 1px solid var(--dsw-alias-border-l1, #e0e0e0); margin-bottom: 4px; min-height: 44px; flex-wrap: wrap; }
.tc-summary-title { font-size: 15px; font-weight: 600; letter-spacing: 0.01em; color: var(--dsw-alias-label-primary, #1a1a2e); margin: 0; }
.tc-summary-stats { display: flex; gap: 12px; font-size: 12px; color: var(--dsw-alias-label-secondary, #888); font-variant-numeric: tabular-nums; align-items: center; flex-wrap: wrap; }
.tc-summary-stat { display: flex; align-items: center; gap: 4px; }
.tc-summary-stat-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; }
.tc-body { padding: 0 0 16px; }
.tc-load-more { text-align: center; padding: 12px; }
.tc-load-more button { background: var(--dsw-alias-bg-layer-1, #f5f5f5); border: 1px solid var(--dsw-alias-border-l1, #ddd); border-radius: 6px; padding: 6px 18px; font-size: 13px; cursor: pointer; color: var(--dsw-alias-label-secondary, #888); font-family: inherit; }
.tc-load-more button:hover { background: var(--dsw-alias-bg-layer-2, #eaeaea); color: var(--dsw-alias-label-primary, #1a1a2e); }
.tc-turn { margin: 0; }
.tc-turn-header { position: sticky; top: 64px; z-index: 9; display: flex; align-items: center; gap: 8px; padding: 8px 20px; background: var(--dsw-alias-bg-layer-1, #f5f5f5); border-bottom: 1px solid var(--dsw-alias-border-l1, #e0e0e0); margin: 0; font-size: 12px; cursor: pointer; user-select: none; transition: background 0.15s; }
.tc-turn-header:hover { background: var(--dsw-alias-bg-layer-2, #eaeaea); }
.tc-turn-header-query { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-primary, #1a1a2e); }
.tc-turn-header-meta { flex-shrink: 0; display: flex; align-items: center; gap: 8px; color: var(--dsw-alias-label-secondary, #888); font-size: 11px; }
.tc-turn-header-arrow { font-size: 9px; color: var(--dsw-alias-label-secondary, #888); transition: transform 0.2s; margin-left: 4px; }
.tc-turn-header-arrow.open { transform: rotate(180deg); }
.tc-turn-body { padding: 4px 0 4px 24px; position: relative; }
.tc-turn-body::before { content: ''; position: absolute; left: 14px; top: 8px; bottom: 8px; width: 2px; background: var(--dsw-alias-border-l1, #e0e0e0); border-radius: 1px; }
.tc-entry { position: relative; padding: 8px 16px 8px 20px; margin: 2px 0; cursor: pointer; border-radius: 6px; transition: all 0.12s ease; border: 1px solid transparent; }
.tc-entry:hover { border-color: var(--dsw-alias-border-l1, #e0e0e0); }
.tc-entry.expanded { border-color: var(--dsw-alias-border-l1, #e0e0e0); }
.tc-entry.kind-user { background: rgba(74, 144, 217, 0.06); border-left: 4px solid var(--dsw-alias-brand-primary, #4a90d9); }
.tc-entry.kind-user:hover { background: rgba(74, 144, 217, 0.10); }
.tc-entry.kind-user.expanded { background: rgba(74, 144, 217, 0.10); }
.tc-entry.kind-assistant { background: rgba(106, 122, 138, 0.04); border-left: 3px solid var(--dsw-alias-label-secondary, #6a7a8a); }
.tc-entry.kind-assistant:hover { background: rgba(106, 122, 138, 0.08); }
.tc-entry.kind-assistant.expanded { background: rgba(106, 122, 138, 0.08); }
.tc-entry.kind-tool-result { background: rgba(58, 154, 106, 0.06); border-left: 3px solid var(--dsw-alias-state-success-primary, #3a9a6a); }
.tc-entry.kind-tool-result:hover { background: rgba(58, 154, 106, 0.10); }
.tc-entry.kind-tool-result.expanded { background: rgba(58, 154, 106, 0.10); }
.tc-entry.kind-turn-error { background: rgba(208, 64, 48, 0.06); border-left: 4px solid var(--dsw-alias-state-error-primary, #d04030); }
.tc-entry.kind-turn-error:hover { background: rgba(208, 64, 48, 0.10); }
.tc-entry.kind-turn-error.expanded { background: rgba(208, 64, 48, 0.10); }
.tc-entry.kind-command { background: rgba(138, 90, 170, 0.05); border-left: 3px solid #8a5aaa; }
.tc-entry.kind-steering { background: rgba(200, 160, 64, 0.05); border-left: 3px solid #c8a040; }
.tc-entry.kind-context { background: rgba(90, 138, 170, 0.05); border-left: 3px solid #5a8aaa; }
.tc-entry.kind-compaction { background: rgba(138, 138, 138, 0.04); border-left: 3px solid #8a8a8a; }
.tc-entry.kind-turn-max-tokens { background: rgba(200, 160, 64, 0.05); border-left: 3px solid #c8a040; }
.tc-entry.kind-model-retry { background: rgba(200, 128, 64, 0.05); border-left: 3px solid #c88040; }
.tc-entry-summary { display: flex; align-items: flex-start; gap: 8px; min-height: 24px; }
.tc-entry-kind { flex-shrink: 0; display: inline-block; padding: 0 7px; font-size: 11px; font-weight: 500; line-height: 20px; border-radius: 3px; letter-spacing: 0.02em; background: var(--dsw-alias-bg-layer-2, #eee); color: var(--dsw-alias-label-secondary, #666); }
.tc-entry-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-primary, #1a1a2e); }
.tc-entry-tokens { flex-shrink: 0; display: flex; align-items: center; gap: 4px; margin-left: 4px; }
.tc-entry-token { display: inline-flex; align-items: center; gap: 3px; padding: 1px 6px; border-radius: 3px; font-size: 11px; font-weight: 500; font-variant-numeric: tabular-nums; line-height: 18px; }
.tc-entry-token-in { background: #dce8f8; color: #2a5a8a; }
.tc-entry-token-out { background: #d8eee4; color: #2a7a5a; }
.tc-entry-token-cache { background: #f4ecd8; color: #8a7030; }
.tc-detail { margin-top: 8px; padding: 12px; background: var(--dsw-alias-bg-layer-1, #f8f8f8); border: 1px solid var(--dsw-alias-border-l1, #e0e0e0); border-radius: 6px; font-size: 13px; line-height: 1.6; overflow-x: auto; animation: tc-fadein 0.15s ease; color: var(--dsw-alias-label-primary, #1a1a2e); }
@keyframes tc-fadein { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.tc-detail pre { margin: 6px 0; padding: 10px; background: var(--dsw-alias-bg-base, #fff); border: 1px solid var(--dsw-alias-border-l1, #e0e0e0); border-radius: 4px; font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace; font-size: 12px; line-height: 1.5; overflow-x: auto; white-space: pre-wrap; word-break: break-all; color: var(--dsw-alias-label-primary, #1a1a2e); }
.tc-detail code { font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace; font-size: 12px; background: var(--dsw-alias-bg-layer-2, #f5f5f5); padding: 1px 4px; border-radius: 3px; color: var(--dsw-alias-label-primary, #1a1a2e); }
.tc-detail-sec { margin: 8px 0; }
.tc-detail-sec:first-child { margin-top: 0; }
.tc-detail-label { font-size: 11px; font-weight: 600; color: var(--dsw-alias-label-secondary, #888); letter-spacing: 0.04em; margin-bottom: 4px; }
.tc-detail-meta { display: flex; flex-wrap: wrap; gap: 14px; margin: 6px 0; font-size: 12px; color: var(--dsw-alias-label-secondary, #888); }
.tc-detail-meta-item { display: flex; gap: 4px; }
.tc-detail-meta-l { font-weight: 500; white-space: nowrap; }
.tc-detail-meta-v { font-variant-numeric: tabular-nums; }
.tc-turn-tokens { flex-shrink: 0; display: flex; align-items: center; gap: 4px; margin-left: 4px; }
.tc-turn-token { display: inline-flex; align-items: center; gap: 2px; padding: 0 5px; border-radius: 3px; font-size: 10px; font-weight: 500; font-variant-numeric: tabular-nums; line-height: 16px; }
.tc-turn-token-in { background: #dce8f8; color: #2a5a8a; }
.tc-turn-token-out { background: #d8eee4; color: #2a7a5a; }
.tc-turn-token-cache { background: #f4ecd8; color: #8a7030; }
.tc-empty { padding: 64px 20px; text-align: center; color: var(--dsw-alias-label-secondary, #888); font-size: 14px; }
@media (max-width: 640px) { .tc-summary { gap: 10px; padding: 8px 12px; } .tc-summary-stats { gap: 8px; font-size: 11px; flex-wrap: wrap; } .tc-turn-header { padding: 6px 12px; top: 56px; } .tc-turn-body { padding-left: 16px; } .tc-entry { padding: 6px 10px 6px 14px; } .tc-entry-tokens { gap: 3px; } .tc-entry-token { font-size: 10px; padding: 0 4px; } .tc-turn-tokens { gap: 3px; } .tc-turn-token { font-size: 9px; padding: 0 3px; } }
`
  document.head.appendChild(style)

  const h = React.createElement

  function ct(blocks) { if (!blocks || !blocks.length) return ''; const texts = []; for (const b of blocks) { if (b.text) texts.push(b.text) }; return texts.join(' ').trim() }
  function sum(str, ml = 80) { if (!str) return ''; const s = str.replace(/\s+/g, ' ').trim(); return s.length <= ml ? s : s.slice(0, ml) + '...' }
  function sj(v) { try { return JSON.stringify(v, null, 2) } catch (_) { return String(v) } }

  const kl = { user: '用户', assistant: '模型', 'tool-result': '工具', command: '命令', steering: '干预', context: '上下文', 'turn-error': '错误', 'turn-max-tokens': '超限', compaction: '压缩', 'model-retry': '重试', unknown: '未知' }

  function legText(node) { if (!node) return ''; if (node.content) return ct(node.content); if (node.blocks) return ct(node.blocks); if (node.message) return node.message; if (node.summary) return node.summary; return '' }
  function ns(node) { return sum(legText(node), 80) || '(空)' }

  function getTokens(node) {
    const u = node.usage
    if (!u || typeof u !== 'object') return null
    const input = u.inputTokens || u.input_tokens || u.input || u.prompt_tokens || u.prompt || u.promptTokens || null
    const output = u.outputTokens || u.output_tokens || u.output || u.completion_tokens || u.completion || u.completionTokens || null
    const cacheR = u.cacheReadTokens || u.cache_read_tokens || u.cache_read_input_tokens || u.cacheRead || u.cache_read || null
    const cacheW = u.cacheWriteTokens || u.cache_write_tokens || u.cache_write_input_tokens || u.cacheWrite || u.cache_write || null
    const think = u.reasoningTokens || u.reasoning_tokens || u.reasoning || u.thinking_tokens || u.thinking || null
    if (input == null && output == null) return null
    return { input, output, cacheR, cacheW, think }
  }

  function fmtTok(val) { if (val == null) return null; if (val < 1000) return String(val); return (val / 1000).toFixed(1) + 'k' }

  function rcb(blocks) { if (!blocks || !blocks.length) return null; const ch = []; for (let i = 0; i < blocks.length; i++) { const b = blocks[i]; if (b.kind === 'text' || b.type === 'text') ch.push(h('div', { key: i, className: 'tc-detail-sec' }, h('div', { className: 'tc-detail-label' }, '文本'), h('pre', null, b.text || ''))); else if (b.kind === 'reasoning') ch.push(h('div', { key: i, className: 'tc-detail-sec' }, h('div', { className: 'tc-detail-label' }, '思考过程'), h('pre', null, b.text || ''))); else if (b.kind === 'tool-call') ch.push(h('div', { key: i, className: 'tc-detail-sec' }, h('div', { className: 'tc-detail-label' }, '工具调用: ' + b.name), h('pre', null, b.argsRaw || ''))); else if (b.kind === 'image') ch.push(h('div', { key: i, className: 'tc-detail-sec' }, h('div', { className: 'tc-detail-label' }, '图片'), h('div', null, '(图片)'))); }; return ch.length ? h('div', null, ch) : null }

  function nd(node) {
    const secs = []; const meta = []; const tokens = getTokens(node)
    switch (node.kind) {
      case 'user': case 'steering': case 'context': secs.push(rcb(node.content)); break
      case 'assistant':
        secs.push(rcb(node.blocks))
        if (tokens) { const tItems = []; if (tokens.input != null) tItems.push(h('span', { key: 'in', className: 'tc-detail-meta-item' }, h('span', { className: 'tc-detail-meta-l' }, '输入:'), h('span', { className: 'tc-detail-meta-v' }, fmtTok(tokens.input)))); if (tokens.output != null) tItems.push(h('span', { key: 'out', className: 'tc-detail-meta-item' }, h('span', { className: 'tc-detail-meta-l' }, '输出:'), h('span', { className: 'tc-detail-meta-v' }, fmtTok(tokens.output)))); if (tokens.think != null) tItems.push(h('span', { key: 'th', className: 'tc-detail-meta-item' }, h('span', { className: 'tc-detail-meta-l' }, '思考:'), h('span', { className: 'tc-detail-meta-v' }, fmtTok(tokens.think)))); if (tokens.cacheR != null) tItems.push(h('span', { key: 'cr', className: 'tc-detail-meta-item' }, h('span', { className: 'tc-detail-meta-l' }, '缓存命中:'), h('span', { className: 'tc-detail-meta-v' }, fmtTok(tokens.cacheR)))); if (tokens.cacheW != null) tItems.push(h('span', { key: 'cw', className: 'tc-detail-meta-item' }, h('span', { className: 'tc-detail-meta-l' }, '缓存写入:'), h('span', { className: 'tc-detail-meta-v' }, fmtTok(tokens.cacheW)))); if (tItems.length) meta.push(h('div', { key: 'tk', className: 'tc-detail-sec' }, h('div', { className: 'tc-detail-label' }, 'Token 消耗'), h('div', { className: 'tc-detail-meta' }, tItems))) }
        if (node.timing) meta.push(h('div', { key: 'tt', className: 'tc-detail-meta-item' }, h('span', { className: 'tc-detail-meta-l' }, '首Token延迟:'), h('span', { className: 'tc-detail-meta-v' }, node.timing.firstTokenTime != null ? String(node.timing.firstTokenTime - (node.timing.stepStartTime || node.timing.firstTokenTime)) + 'ms' : '--'))); if (node.provenance) meta.push(h('div', { key: 'pv', className: 'tc-detail-meta-item' }, h('span', { className: 'tc-detail-meta-l' }, '模型:'), h('span', { className: 'tc-detail-meta-v' }, node.provenance.model || '?'))); break
      case 'tool-result': if (node.call) secs.push(h('div', { key: 'args', className: 'tc-detail-sec' }, h('div', { className: 'tc-detail-label' }, '工具: ' + node.call.name), h('pre', null, node.call.argsRaw || ''))); secs.push(rcb(node.content)); if (node.isError) secs.push(h('div', { key: 'err', className: 'tc-detail-sec' }, h('div', { className: 'tc-detail-label' }, '错误'), h('pre', null, sj(node.error)))); break
      case 'command': secs.push(h('div', { key: 'cmd', className: 'tc-detail-sec' }, h('div', { className: 'tc-detail-label' }, '命令: ' + (node.name || '?')), node.args != null ? h('pre', null, node.args) : null)); if (node.outcome) secs.push(h('div', { key: 'out', className: 'tc-detail-sec' }, h('div', { className: 'tc-detail-label' }, '执行结果'), node.outcome.text ? h('pre', null, node.outcome.text) : null)); break
      case 'turn-error': secs.push(h('div', { key: 'err', className: 'tc-detail-sec' }, h('div', { className: 'tc-detail-label' }, '错误信息'), h('pre', null, node.message || ''))); if (node.code) meta.push(h('div', { key: 'code', className: 'tc-detail-meta-item' }, h('span', { className: 'tc-detail-meta-l' }, '错误码:'), h('span', { className: 'tc-detail-meta-v' }, node.code))); break
      case 'compaction': if (node.summary) secs.push(h('div', { key: 'sum', className: 'tc-detail-sec' }, h('div', { className: 'tc-detail-label' }, '压缩摘要'), h('pre', null, node.summary))); if (node.shadowedItemCount != null) meta.push(h('div', { key: 'si', className: 'tc-detail-meta-item' }, h('span', { className: 'tc-detail-meta-l' }, '替换条目:'), h('span', { className: 'tc-detail-meta-v' }, String(node.shadowedItemCount)))); if (node.shadowedTokenCount != null) meta.push(h('div', { key: 'st', className: 'tc-detail-meta-item' }, h('span', { className: 'tc-detail-meta-l' }, '替换Token:'), h('span', { className: 'tc-detail-meta-v' }, String(node.shadowedTokenCount)))); break
      default: if (node.content) secs.push(rcb(node.content)); else if (node.blocks) secs.push(rcb(node.blocks)); break
    }
    const result = []; if (meta.length) result.push(h('div', { key: 'm', className: 'tc-detail-meta' }, meta)); for (const s of secs) if (s != null) result.push(s); return result.length ? h('div', null, result) : null
  }

  function TView(props) {
    const { useSession, inspect, onInspectDone, loadOlder } = props
    const [expSeq, setExpSeq] = React.useState(null)
    const [expTurns, setExpTurns] = React.useState(null)
    const snap = useSession(s => s)

    React.useEffect(() => { if (inspect && inspect.callId) { setExpSeq(inspect.callId); const el = document.getElementById('tc-' + inspect.callId); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (onInspectDone) onInspectDone() } }, [inspect])

    React.useEffect(() => {
      const els = document.querySelectorAll('[data-slot*="composer"], [data-slot*="input"], [class*="InputBar"], [class*="composer"]')
      const hidden = []
      els.forEach(el => { if (el.offsetParent !== null) { el.style.setProperty('display', 'none', 'important'); hidden.push(el) } })
      return () => { hidden.forEach(el => { el.style.display = '' }) }
    }, [])

    const allNodes = React.useMemo(() => { if (!snap || !snap.views) return null; const traj = snap.views.get('trajectory'); if (traj && traj.eventNodes && traj.eventNodes.length) return traj.eventNodes; return null }, [snap])
    const nodes = allNodes || (snap && snap.nodes) || []

    const turns = React.useMemo(() => {
      if (!nodes || !nodes.length) return []
      const groups = []; let cur = []; let curQuery = ''; let turnIdx = 0
      const pushTurn = () => {
        if (cur.length > 0) {
          if (!curQuery) { for (const n of cur) { const t = legText(n); if (t) { curQuery = sum(t, 100); break } } }
          groups.push({ turn: turnIdx, nodes: cur, query: curQuery }); turnIdx++
        }
      }
      for (const n of nodes) {
        if (n.kind === 'user') { pushTurn(); cur = [n]; curQuery = sum(legText(n), 100) }
        else { cur.push(n) }
      }
      pushTurn()
      return groups
    }, [nodes])

    const stats = React.useMemo(() => {
      let errs = 0, tools = 0, totalIn = 0, totalOut = 0, totalCache = 0
      for (const n of nodes) { if (n.kind === 'turn-error') errs++; if (n.kind === 'tool-result') tools++; const t = getTokens(n); if (t) { if (t.input) totalIn += t.input; if (t.output) totalOut += t.output; if (t.cacheR) totalCache += t.cacheR } }
      return { total: nodes.length, turns: turns.length, errors: errs, tools, inTok: totalIn, outTok: totalOut, cacheTok: totalCache }
    }, [nodes, turns])

    if (!nodes.length) return h('div', { className: 'tc' }, h('div', { className: 'tc-empty' }, '暂无记录'))

    const toggleTurn = t => setExpTurns(p => p === t ? null : t)
    const toggleAll = () => setExpTurns(p => p === '__all__' ? null : '__all__')
    const allExpanded = expTurns === '__all__'

    const summaryItems = [h('span', { key: 'total', className: 'tc-summary-stat' }, String(stats.total), '条'), h('span', { key: 'turns', className: 'tc-summary-stat' }, String(stats.turns), '轮')]
    if (stats.inTok > 0 || stats.outTok > 0) { summaryItems.push(h('span', { key: 'in', className: 'tc-summary-stat' }, h('span', { className: 'tc-summary-stat-dot', style: { background: 'var(--dsw-alias-brand-primary, #4a90d9)' } }), '输入', fmtTok(stats.inTok))); summaryItems.push(h('span', { key: 'out', className: 'tc-summary-stat' }, h('span', { className: 'tc-summary-stat-dot', style: { background: 'var(--dsw-alias-state-success-primary, #3a8a6a)' } }), '输出', fmtTok(stats.outTok))) }
    if (stats.cacheTok > 0) summaryItems.push(h('span', { key: 'cache', className: 'tc-summary-stat', style: { color: '#c8a040' } }, h('span', { className: 'tc-summary-stat-dot', style: { background: '#c8a040' } }), '缓存', fmtTok(stats.cacheTok)))
    if (stats.errors > 0) summaryItems.push(h('span', { key: 'errs', className: 'tc-summary-stat', style: { color: 'var(--dsw-alias-state-error-primary, #c0392b)' } }, h('span', { className: 'tc-summary-stat-dot', style: { background: 'var(--dsw-alias-state-error-primary, #c0392b)' } }), String(stats.errors), '错误'))
    if (stats.tools > 0) summaryItems.push(h('span', { key: 'tools', className: 'tc-summary-stat', style: { color: 'var(--dsw-alias-state-success-primary, #3a8a6a)' } }, h('span', { className: 'tc-summary-stat-dot', style: { background: 'var(--dsw-alias-state-success-primary, #3a8a6a)' } }), String(stats.tools), '工具'))

    const turnEls = turns.map(turn => {
      const isTurnExpanded = allExpanded || expTurns === turn.turn; const turnNodes = isTurnExpanded ? turn.nodes : []
      let turnIn = 0, turnOut = 0, turnCache = 0; for (const n of turn.nodes) { const t = getTokens(n); if (t) { if (t.input) turnIn += t.input; if (t.output) turnOut += t.output; if (t.cacheR) turnCache += t.cacheR } }
      const turnTokenEls = []; if (turnIn > 0) turnTokenEls.push(h('span', { key: 'in', className: 'tc-turn-token tc-turn-token-in' }, '\u2191', fmtTok(turnIn))); if (turnOut > 0) turnTokenEls.push(h('span', { key: 'out', className: 'tc-turn-token tc-turn-token-out' }, '\u2193', fmtTok(turnOut))); if (turnCache > 0) turnTokenEls.push(h('span', { key: 'ca', className: 'tc-turn-token tc-turn-token-cache' }, '\u2606', fmtTok(turnCache)))
      const entries = turnNodes.map(node => {
        const kind = node.kind; const isExpanded = expSeq === node.seq || expSeq === node.callId; const detail = isExpanded ? nd(node) : null; const tokens = getTokens(node)
        const tokenEls = []; if (tokens) { if (tokens.input) tokenEls.push(h('span', { key: 'in', className: 'tc-entry-token tc-entry-token-in' }, '\u2191', fmtTok(tokens.input))); if (tokens.output) tokenEls.push(h('span', { key: 'out', className: 'tc-entry-token tc-entry-token-out' }, '\u2193', fmtTok(tokens.output))); if (tokens.cacheR) tokenEls.push(h('span', { key: 'ca', className: 'tc-entry-token tc-entry-token-cache' }, '\u2606', fmtTok(tokens.cacheR))) }
        return h('div', { key: node.seq, id: 'tc-' + (node.callId || node.seq), className: 'tc-entry kind-' + kind + (isExpanded ? ' expanded' : ''), onClick: () => setExpSeq(isExpanded ? null : node.seq) }, h('div', { className: 'tc-entry-summary' }, h('span', { className: 'tc-entry-kind' }, kl[kind] || kind), h('span', { className: 'tc-entry-text' }, ns(node)), tokenEls.length ? h('span', { className: 'tc-entry-tokens' }, tokenEls) : null), detail ? h('div', { className: 'tc-detail' }, detail) : null)
      })
      return h('div', { key: turn.turn, className: 'tc-turn' }, h('div', { className: 'tc-turn-header', onClick: () => toggleTurn(turn.turn) }, h('span', { className: 'tc-turn-header-query' }, turn.query || '#' + String(turn.turn + 1)), h('span', { className: 'tc-turn-header-meta' }, h('span', null, '#' + String(turn.turn + 1)), h('span', null, String(turn.nodes.length) + '条')), turnTokenEls.length ? h('span', { className: 'tc-turn-tokens' }, turnTokenEls) : null, h('span', { className: 'tc-turn-header-arrow' + (isTurnExpanded ? ' open' : '') }, '\u25BC')), isTurnExpanded ? h('div', { className: 'tc-turn-body' }, entries) : null)
    })

    return h('div', { className: 'tc' },
      h('div', { className: 'tc-summary' }, h('h2', { className: 'tc-summary-title' }, '轨迹'), h('div', { className: 'tc-summary-stats' }, summaryItems), h('button', { onClick: toggleAll, style: { marginLeft: 'auto', background: 'none', border: '1px solid var(--dsw-alias-border-l1, #ddd)', borderRadius: 4, padding: '2px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--dsw-alias-label-secondary, #888)', fontFamily: 'inherit' } }, allExpanded ? '折叠全部' : '展开全部')),
      snap && snap.hasMore && loadOlder ? h('div', { className: 'tc-load-more' }, h('button', { onClick: () => loadOlder() }, '加载更早记录')) : null,
      h('div', { className: 'tc-body' }, turnEls),
    )
  }

  ctx.interval(() => { const btns = document.querySelectorAll('button'); let found = 0; for (let i = 0; i < btns.length; i++) { if (btns[i].textContent && btns[i].textContent.trim() === '轨迹') { found++; if (found >= 2) { btns[i].style.display = 'none' } } } }, 300)

  slots.inject('conversation.view', () => slots.register({ name: 'conversation.view', id: 'trajectory-clean', order: 10, label: '轨迹', inject: (sessionId) => { const sessions = ctx.get('sessions'); const binding = sessions && sessions.binding(sessionId); const session = binding ? binding.session : undefined; if (!session) return {}; return { loadOlder: () => { const p = session.loadOlder ? session.loadOlder() : Promise.resolve(); return Promise.resolve(p).then(() => true) } } } }, props => React.createElement(TView, props)))
}