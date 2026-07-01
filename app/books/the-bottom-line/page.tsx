"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import "./book.css";
import "./audio.css";
import {
  PODCAST, K, RATES, uid, fmtTime, loadJSON, saveJSON, buildShareCardSVG,
  BOOK_TITLE, BOOK_AUTHOR,
  type Note, type Highlight, type Bookmark, type DownloadState, type Progress,
} from "./audioData";

/* ── Concept definitions ─────────────────────────────────────── */
const CONCEPTS: Record<string, { name: string; definition: string }> = {
  ch4:  { name: "The Floor",                 definition: "The minimum a system commits to — not its best performance, but what it structurally guarantees regardless of circumstance. Real, legible, and held." },
  ch5:  { name: "The Signal",                definition: "The moment a system's accumulated floor becomes self-transmitting — when the market declares reliability rather than the system claiming it." },
  ch6:  { name: "Tide · Milestone · Ascent", definition: "The three phases every system moves through: formation without reliability, the credibility crossing, and competition for position at the highest level." },
  ch7:  { name: "The Ladder",                definition: "The sequential architecture of trust — from local credibility to global capital markets, each rung requiring demonstrably stronger evidence." },
  ch10: { name: "The Shield",                definition: "The protective power of a demonstrated floor: the standing to reject extractive terms and negotiate from credibility, not desperation." },
  ch12: { name: "The Audit",                 definition: "An honest reckoning with actual floor — revealing the gap between what a system claims about itself and what the market can verify." },
  ch13: { name: "The Commitment",            definition: "A declaration, not a plan. The moment a system draws a line in its own history and says: below this, never again." },
  ch14: { name: "The Practice",              definition: "The stage at which holding the floor is no longer an act of discipline but an expression of identity — what the system does without thinking." },
  ch15: { name: "The Raise",                 definition: "Not a decision but a reaction — the inevitable consequence of compound consistency, when the current floor becomes the new starting point." },
};

/* ── Audio per chapter ───────────────────────────────────────── */
const AUDIO: Record<string, { label: string; src: string }> = {
  before: { label: "NARRATION",  src: "/audio/tbl-before.mp3" },
  ch1:    { label: "NARRATION",  src: "/audio/tbl-ch01.mp3"   },
  ch2:    { label: "NARRATION",  src: "/audio/tbl-ch02.mp3"   },
  ch3:    { label: "NARRATION",  src: "/audio/tbl-ch03.mp3"   },
  ch4:    { label: "NARRATION",  src: "/audio/tbl-ch04.mp3"   },
  ch5:    { label: "NARRATION",  src: "/audio/tbl-ch05.mp3"   },
  ch6:    { label: "NARRATION",  src: "/audio/tbl-ch06.mp3"   },
  ch7:    { label: "NARRATION",  src: "/audio/tbl-ch07.mp3"   },
  ch8:    { label: "NARRATION",  src: "/audio/tbl-ch08.mp3"   },
  ch9:    { label: "NARRATION",  src: "/audio/tbl-ch09.mp3"   },
  ch10:   { label: "NARRATION",  src: "/audio/tbl-ch10.mp3"   },
  ch11:   { label: "PODCAST",    src: "/audio/tbl-ch11.mp3"   },
  ch12:   { label: "NARRATION",  src: "/audio/tbl-ch12.mp3"   },
  ch13:   { label: "NARRATION",  src: "/audio/tbl-ch13.mp3"   },
  ch14:   { label: "NARRATION",  src: "/audio/tbl-ch14.mp3"   },
  ch15:   { label: "NARRATION",  src: "/audio/tbl-ch15.mp3"   },
  ch16:   { label: "NARRATION",  src: "/audio/tbl-ch16.mp3"   },
  ch17:   { label: "NARRATION",  src: "/audio/tbl-ch17.mp3"   },
};

/* ── Book chapters ───────────────────────────────────────────── */
const CHAPTERS = [
  { id:"cover", type:"cover" as const, part:null, num:null, title:"THE BOTTOM LINE", subtitle:"Building Trusted Systems", author:"Sheja Vallière", body:[] as string[], pull:null },
  { id:"before", type:"chapter" as const, part:null, num:null, title:"Before", subtitle:"Think of the last time you were in a room where a decision was being made about something you had built.", body:[
    "A pitch meeting, a selection process, a negotiation, a review. You knew the quality of what you had brought. You knew the hours behind it, the discipline inside it, the standard you had held when no one was paying attention.",
    "And you watched the room evaluate it through a lens that could not quite read what you were showing them. Not because they were hostile but because the language in which your quality was expressed was not yet the language they had been trained to trust.",
    "It is not about working harder. It is not about dreaming bigger. It is about something more precise and more actionable:",
    "The construction of the evidence that makes what you already are, legible to the world that needs to trust you.",
    "There is a state for what exists before that evidence is built. Before the floor is established, before the market has found its basis for confidence, before the signal has been sent and received. There is movement without direction, energy without form, potential that has not yet resolved into proof: The Tide.",
    "It is not failure; it is formation. Every system that has ever mattered began in the Tide. The question is never whether you will leave it. It is how deliberately you will build your way through it. The only way to reach your Milestone.",
    "The moment the floor is established, the moment consistent behavior over time produces a new classification in the world's understanding of what you are. It is not a celebration; it is a reclassification. The world updates its model of you. What was speculative, becomes calculable. What was a bet, becomes an investment. What was a question, becomes an answer.",
    "The Milestone is the step to the Ascent. When the floor has been raised to the level at which the only remaining question is not whether you belong but how high you will go. The clear passage, the heading held. The competition is real, but the question of belonging is permanently behind you.",
    "Tide. Milestone. Ascent. Three phases. One system.",
  ], pull:"The construction of the evidence that makes what you already are, legible to the world that needs to trust you." },
  { id:"ch1", type:"chapter" as const, part:"PART I — THE STAKES", num:"01", title:"The Room", subtitle:"Made you look", body:[
    "You know exactly what it looks like. The boardroom of a fund you have been pitching for two years, the desk of a commissioner who controls the broadcast rights, the office of the Minister whose signature would change everything, the inbox of the label executive who has not yet replied.",
    "Maybe the room is more abstract: the consciousness of a global audience, the confidence of an international partner, the conviction of a development bank that your project is worth the risk. Whatever form it takes, you know the room. You have been preparing for it. You have done the work. And yet the door has not opened.",
    "Why? The standard answer is that you need better performance, more credentials, stronger networks, or more time. These things matter but they are not the root answer. The root answer is simpler and more structural, and once you understand it, it changes everything about how you approach the challenge of being taken seriously in the world.",
    "Here is the root answer: The world does not reward performance. It rewards the belief that performance will continue. The world does not reward what you have done. It rewards the belief — the calculated, evidence-based belief — that you will keep doing it. That you will not suddenly stop. That you will not collapse when pressure arrives. That the version of you that showed up today is not an exception but a floor.",
    "This is why a company with standard but consistent returns attracts more serious capital than one with brilliant but volatile results. This is why a small but highly credible country secures more favorable sovereign debt terms than one whose potential is spectacular but unpredictable. This is why the good athlete with regular results but injury-free decade commands more trust from sponsors than the genius who burns bright and disappears.",
    "The world is not looking for brilliance. The world is looking for reliability. And learning how to build it, hold it, declare it, and raise it, is the most important strategic skill any system — any person, any team, any organization, any nation — can develop.",
  ], pull:"The world does not reward performance. It rewards the belief that performance will continue." },
  { id:"ch2", type:"chapter" as const, part:"PART I — THE STAKES", num:"02", title:"The Trust", subtitle:"How confidence flows", body:[
    "We experience trust as something emotional. We feel it toward people and institutions the way we feel warmth or cold. But, underneath that feeling, is a cognitive process that the brain performs constantly and largely unconsciously: the evaluation of predictability. To trust something, is to predict that it will behave in a certain way when it matters. To distrust, is to be unable to make that prediction with confidence.",
    "This matters enormously for anyone trying to attract capital, partnership, or opportunity. Because it means that trust is not arbitrary. It is not about likability, luck or who you know. It is about evidence.",
    "Specifically, it is about the evidence a system provides that its future behavior can be predicted from its past behavior. And here is the structural problem: the systems that most need trust — the emerging market seeking foreign direct investment, the startup without a track record, the artist without a catalog, the nation rebuilding its institutions after a crisis — are precisely the systems with the least historical evidence to offer.",
    "They are being asked to prove predictability when their history is too short, too volatile, or not documented to make a confident prediction possible. This is not a moral failure; it is an information problem. The opportunity provider — the investor, the partner, the broadcaster, the policy institution — is not being cruel when they withhold engagement; they are being rational. They cannot calculate the risk because they cannot read the system.",
    "And, when you cannot calculate a risk, you do not take it. The conventional response to this problem is to try to tell a better story. To present more compellingly, to find the right introduction, to refine the pitch until it is irresistible. These efforts are not wasted. But they address the symptom rather than the disease. A better story does not substitute for a better signal.",
    "And the signal that matters — the one that moves the calculation from distrust to trust — is not the story you tell about yourself. It is the floor you demonstrate beneath yourself.",
    "Consider two systems: The first has had two exceptional years followed by a difficult one, followed by another exceptional year. Its average performance is high, its story is compelling but its floor — the minimum it can guarantee — is unclear. The second system has had four consecutive years of solid, regular performance. Its average is lower, its story is less dramatic, but its floor is visible.",
    "Opportunity providers looking at both systems are not looking at averages; they are looking at floors. Because the floor is what tells them what happens in the worst case. And in a world of limited information, the worst case is what they need to be able to predict.",
    "This is the beginning of the Bottom Line: Trust flows to demonstrable floors.",
  ], pull:"Trust flows to demonstrable floors." },
  { id:"ch3", type:"chapter" as const, part:"PART I — THE STAKES", num:"03", title:"The Excluded", subtitle:"The burden of the denied", body:[
    "It is the exclusion that comes from never having been given the chance to prove you will not fail. It is the exclusion of the emerging market that is properly governed but simply unknown. Or the first-generation entrepreneur who is not incompetent but simply uncredentialed. Or the film industry in a country whose cinema has never been distributed beyond its borders, not because it is bad, but because no one outside has yet developed the framework for evaluating it.",
    "This form of exclusion is structural. It does not respond to working harder or dreaming bigger or refining the pitch one more time. It responds only to the creation of a new kind of evidence — evidence that says: We are here, we have held this standard, and we will continue to hold it. Come see for yourself.",
    "The world of global capital and opportunity is organized around systems that have already demonstrated their floors. The credit rating exists because someone proved theirs. The international standard exists because someone held a consistent practice, long enough, that it became the reference point. The major league, the premium distribution deal, the sovereign bond — these are all structures built on the assumption that the systems operating within them have established legible, verifiable reliability.",
    "What does this mean for systems that are still building, still in the process of establishing their floor? It is that they are being evaluated by criteria designed for systems further along than they are. They are being asked to show proof of reliability using evidence frameworks designed for systems that have already been reliable for decades.",
    "This is the excluded paradox: You need a track record to get the opportunity, but you need the opportunity to build the track record.",
    "The Bottom Line is, at its core, an answer to this paradox. Not a way around it — there is no way around the fundamental requirement of demonstrated reliability — but a way through it. A structured, principled approach to build the evidence base that transforms an unknown system into a trusted one, rung by rung, signal by signal, floor by floor.",
    "It begins not with a shortcut but with a decision. The decision to stop performing for applause and start building for proof.",
  ], pull:"You need a track record to get the opportunity, but you need the opportunity to build the track record." },
  { id:"ch4", type:"chapter" as const, part:"PART II — THE FRAMEWORK", num:"04", title:"The Floor", subtitle:"The Bottom Line structure", body:[
    "This is the most important thing to understand about the Bottom Line, before anything else. It is not a target, it is not an aspiration, it is not the best you can do. It is the minimum you commit to. Not for a single quarter, not in your best conditions, not when everything is working, but always, structurally, regardless of circumstance.",
    "The distinction matters because most systems are optimized to perform at their peak. They orient themselves around the best-case scenario — the record-breaking quarter, the perfect season, the breakthrough film, the viral campaign. They celebrate their highs and explain away their lows as anomalies, bad luck, circumstances beyond their control.",
    "The market — meaning every audience, every evaluator, every opportunity provider that matters — does not share this orientation. The market has seen too many anomalies. Too many record-breaking quarters followed by implosions. Too many breakthrough films from studios that then disappeared. Too many viral moments that turned out to be peaks rather than floors.",
    "The market has learned, through painful and expensive experience, to pay more attention to lows than to highs. To not ask, \"What is the best this system has produced?\" but \"What is the worst I should expect?\" When the answer to that second question is unclear — when the floor is invisible or undocumented or simply nonexistent — the market assigns the worst imaginable answer and prices accordingly.",
    "This is why establishing a Bottom Line is not about lowering your ambition. It is about elevating your floor until it is high enough and visible enough that the market can use it as a basis for confident engagement.",
    "The Bottom Line operates on three dimensions simultaneously. First, it must be real. Not claimed but demonstrated, not promised but proven, through consistent behavior over a meaningful period. Second, it must be legible. Not just visible to those inside the system but readable by those outside it, in the language and format that the relevant audience uses to make decisions. Third, it must be held. Not achieved once and then abandoned but maintained as the non-negotiable minimum beneath which the system simply does not go.",
    "When all three conditions are met, something fundamental shifts in the relationship between the system and the market. The system stops being evaluated as a speculation and starts being evaluated as a calculable risk. And calculable risk is the raw material from which opportunity is built.",
  ], pull:"It is not a target. It is not an aspiration. It is the minimum you commit to." },
  { id:"ch5", type:"chapter" as const, part:"PART II — THE FRAMEWORK", num:"05", title:"The Signal", subtitle:"Wordless Pitch", body:[
    "When a system has held its Bottom Line long enough, consistently enough, and in terms legible enough to the market, something remarkable happens: the signal transmits itself. You no longer need to argue for your credibility; the record argues for you, the pattern speaks. The floor held visibly and verifiably over time, becomes its own announcement.",
    "This is what distinguishes a Bottom Line from a brand promise. A brand promise is something you say about yourself. A Bottom Line is something the market says about you. Because you have given it no choice but to say it. You have removed the uncertainty; you have made the calculation obvious.",
    "Consider what happens when a nation achieves an investment-grade sovereign credit rating for the first time. The rating agency did not assign that rating because they liked the government or found the country's story compelling. They assigned it because the evidence — audited, verified, and benchmarked against international standards across multiple economic cycles — made any other conclusion indefensible.",
    "Or consider what happens when a sports team wins promotion to a higher division and then survives there for three consecutive seasons. In the first season, their presence is provisional. We wait to see. In the second season, they are interesting. In the third, something changes: they are no longer a promoted team. They are a team that belongs at this level.",
    "The signal becomes self-transmitting at a specific threshold — the moment the accumulated evidence makes belief easier than doubt. Before that threshold, the evaluator is constructing trust from incomplete information, actively bridging the gaps with assumption. After it, they would need to work against the conclusion the record is forcing. The floor has not simply reduced uncertainty. It has reversed the burden.",
    "The evaluator is no longer asking 'Is there enough evidence to trust this system?' They are asking 'Is there any evidence left to doubt it?' That inversion is the signal. And it arrives not from an announcement but from the weight of the record itself.",
    "The signal has two audiences, and understanding both is essential. The primary audience is the opportunity provider — the investor, the partner, the institution, the market — that will start moving toward you, with confidence through the evidences provided. The secondary audience is every other system watching. When one emerging market establishes a credible Bottom Line and attracts serious global capital as a result, every other emerging market takes note. You become a proof of concept.",
    "The Bottom Line does not just open doors for the system that holds it. It begins to open doors for the category. One Bottom Line, held and communicated well, does not benefit one system. It begins to rewrite the market's belief about what is possible from systems like it. One verified exception is enough to break a market assumption. When a system crosses the line, it transforms a category from being judged by prejudice to being judged by evidence, creating visibility for every system that follows.",
  ], pull:"A brand promise is something you say about yourself. A Bottom Line is something the market says about you." },
  { id:"ch6", type:"chapter" as const, part:"PART II — THE FRAMEWORK", num:"06", title:"Tide, Milestone, Ascent", subtitle:"The timeline", body:[
    "The system has three phases. Each phase has its own character, its own dangers, and its own specific demands. Understanding which phase your system is in — and refusing to pretend otherwise — is the prerequisite for everything that follows.",
    "The first phase is the Tide. This is where every system begins. In the Tide, results are real but inconsistent. The system has capacity but not yet reliability. It can perform, sometimes brilliantly, but the performance is not yet structural. It is still dependent on ideal conditions, exceptional effort, or favorable circumstances. When conditions change, so does the output. The floor is not yet visible because the floor has not yet been built.",
    "The danger of the Tide is not failure. Failure in this phase is survivable and expected. The danger is the illusion of arrival — the belief, generated by a peak performance or a fortunate quarter or a viral moment, that the system has already crossed a threshold it has not yet crossed. Systems that confuse peaks for floors do not build Bottom Lines. They chase highs while the foundation beneath them remains unbuilt, and they are perpetually surprised when the market continues to treat them as speculative.",
    "The second phase is the Milestone. This is the crossing. It is not a single moment but a recognized pattern. The point at which a system's consistent behavior over time produces a new classification in the market's understanding. The system is no longer unknown, it is no longer speculative, it has demonstrated a floor; and the market has read it.",
    "The Milestone is not announced by the system; it is acknowledged by the market. And this is why the work of the Tide — the slow, unglamorous accumulation of consistent performance — cannot be shortcut. You cannot declare your own Bottom Line. You can only hold it until the market declares it for you. The crossing of the Milestone changes everything about the system's relationship with opportunity. Better capital becomes available, more serious partnerships become possible. Doors that were previously sealed do not fly open, but they become doors rather than walls.",
    "The third phase is the Ascent. This is where the system competes not for credibility but for dominance. The Ascent has its own volatility. At the top, the margins are thin, the competition is fierce, and results will fluctuate. But the volatility of the Ascent is qualitatively different from the instability of the Tide. It is the variance of excellence among reliable systems, not the variance of unreliability. The market understands this distinction and does not re-rate a credible system for the normal fluctuations of serious competition.",
    "The Ascent is not a destination; it is a category of competition. And the only way to enter, is to hold a floor high enough and long enough that the market has no rational basis for excluding you.",
    "Tide. Milestone. Ascent. Three phases. One system.",
  ], pull:"Tide. Milestone. Ascent. Three phases. One system." },
  { id:"ch7", type:"chapter" as const, part:"PART II — THE FRAMEWORK", num:"07", title:"The Ladder", subtitle:"The standard. Your standing.", body:[
    "Every system that has ever successfully attracted serious global capital, serious global partnership, or serious global attention has climbed a ladder. Not jumped to the top, climbed. Rung by rung, each step building the evidence base that made the next step possible.",
    "The Ladder is the structural architecture of this process. It describes the sequence of audiences, thresholds, and trust signals that a system must navigate on its way from local emergence to global participation. Understanding the Ladder — knowing which rung you are on, what the current rung requires, and what the next rung demands — is essential to make strategic decisions about where to invest your consistency.",
    "Before examining each rung, one question orients everything that follows: Who is currently evaluating your system, and what do they need in order to trust it? Not who you want to be evaluated by. Who is actually making decisions about you right now. The audience tells you the rung. And the rung tells you where to invest your consistency.",
    "The Ladder starts with local credibility. At this level, the audience is immediate — the community you serve, the local market you operate in, the immediate stakeholders who can see your work directly. The trust signal required here is simple and human. Show up consistently, deliver what you promise, and be present when things get difficult. The evidence is informal but real: reputation, word of mouth, the accumulating weight of people who have experienced you and found you reliable. This rung is not glamorous; it does not generate international press releases or attract development finance institution attention. But it is the rung that every subsequent rung stands on.",
    "Regional recognition is the second rung. Here the audience expands beyond immediate stakeholders to the broader ecosystem — regional funders, sector organizations, national media, peer institutions. The evidence required at this rung is more formal: documented results, comparative benchmarks, endorsement of credible regional actors. The system that has earned local credibility, now needs to make that credibility legible beyond its immediate community.",
    "National standing is the third rung. This is where systems begin to engage with formal institutional structures — national development institutions, national investment vehicles, established industry bodies. The trust signal required here is structural rather than relational. It implies governance frameworks, audited financial records, compliance with national regulatory standards, measurable impact documented in formats that institutional actors can read and verify.",
    "International access is the fourth rung. This is the first rung where global capital becomes a realistic possibility. Development finance institutions, international impact investors, cross-border partnerships, multilateral programs — these actors engage at this level. The evidence required is internationally benchmarked: third-party, international audits, performance data that can be compared against global standards rather than just local context.",
    "Global capital markets is the fifth rung. The level at which sovereign wealth funds, major private equity firms, multinational corporations, and global financial institutions engage. The evidence required here is the most demanding: full transparency, sustained performance across economic cycles, cross-border track record, governance structures that meet international best practice across every dimension.",
    "The Ladder is not arbitrary. Each rung's requirements exist because the audience at that level is managing risks at a corresponding scale. A local funder risking a small amount can rely on relational trust. A sovereign wealth fund risking capital at national scale cannot. The formalization of evidence requirements at each rung is not bureaucratic obstruction. It is the market's rational response to the increasing scale of the trust being extended.",
    "At every rung, mistakes appear in different forms: systems attempt to access the next level before their current floor has become structural. They accelerate before stability, translate before depth, document before verification, and seek recognition before securing the standards that sustain it.",
    "Credibility does not travel because a system claims it should. It travels because the floor beneath it is so visible, so verified, and so consistently held that trust becomes the rational conclusion. The systems that endure are not the ones that reach the next rung fastest. They are the ones that arrive with a floor strong enough to remain there.",
    "Progression is never automatic. Every transition has a cost. Moving from local to regional requires time, because patterns cannot be rushed. Moving from regional to national requires structure, because relationships do not scale. Moving from national to international requires trusted verification, because credibility travels through recognized standards. Moving from international to global requires patience, because no shortcut exists to a multi-cycle track record. These are not obstacles to the climb. They are the architecture of it.",
  ], pull:"The audience tells you the rung. The rung tells you where to invest your consistency." },
  { id:"ch8", type:"chapter" as const, part:"PART III — THE MESSAGE", num:"08", title:"The Gap", subtitle:"Real. But unread.", body:[
    "You know the quality of your team's commitment. You know the depth of your community's loyalty. You know the resilience your organization has demonstrated in conditions that never made the formal record. You know the relationships that underpin your operations, the institutional knowledge that cannot be captured in a spreadsheet, the values that have held the culture together through every difficult period.",
    "And none of it is legible to the global capital provider, evaluating your system from ten thousand kilometers through nothing but the documents you have provided and the standards they can benchmark against. This is the translation gap. It is not a gap in your performance, it is a gap in your communication. Specifically, in your ability to convert locally meaningful evidence of reliability into globally readable signals of trust.",
    "The gap exists because the global capital ecosystem was built by systems that have been operating within it for a long time. They developed their own languages: credit ratings, impact measurement frameworks. They developed their own translators: accounting firms, rating agencies, audit bodies, impact verifiers. And they now require that any system seeking to engage with them speak those languages, through those translators.",
    "This is not inherently unjust, though it can feel that way. Every market develops its own communication standards. The question is not whether the standards are fair. The question is whether you are willing to learn the language. Closing the translation gap is a strategic investment, not an administrative burden. Every step toward international-standard reporting, third-party verification, and globally comparable documentation is a step toward making the invisible, visible.",
    "It is worth sitting with what the gap actually costs before moving to what closes it. A system with a genuine floor and no legible documentation of it is evaluated at precisely the same level as a system with no floor at all. Not because the evaluator is hostile. Because through their standards, both systems look identical. Both present as unverifiable. Both carry the same discount. Both receive the same terms — or more precisely, neither receives the terms the documented system would have earned.",
    "The genuine quality is there. It simply produces no return. Because the market cannot see it. That is the gap. And understanding precisely how wide it is, in your specific context, is the beginning of closing it.",
  ], pull:"A system with a genuine floor and no legible documentation of it is evaluated at precisely the same level as a system with no floor at all." },
  { id:"ch9", type:"chapter" as const, part:"PART III — THE MESSAGE", num:"09", title:"The Language", subtitle:"Standardize your legibility", body:[
    "When a system adopts accounting standards, it is not simply changing the format of its financial statements. It is making those statements readable by every capital provider in the world who uses them as their reference. The act of adoption is a signal: We are willing to be held accountable by the same measures you use to evaluate everyone else. We are not asking for special consideration. We are asking to be read.",
    "This is the strategic logic of every international standard. None of these standards are perfect. All of them can be gamed. But their strategic value for emerging-context systems is not their perfection, it is their recognizability. When you speak a language the market already knows how to read, you reduce the cognitive work required of the evaluator. And reduced cognitive work means reduced friction. And reduced friction means faster movement from evaluation to engagement.",
    "Third-party verification is the complement to standards adoption. Self-reported performance, however accurate, carries a discount in the trust calculation. The market has seen too many self-reported figures that did not survive scrutiny. Independent verification — by auditors, rating agencies, impact assessors, certification bodies — transfers a portion of the verifier's credibility to the verified. The choice of verifier matters as much as the act. Engaging a locally recognized auditor signals local credibility; an internationally recognized one signals international readiness. Target your verifiers at the level of the audience you are seeking, or slightly above.",
    "Track record construction is another element of the language and the most patient. A track record is not built in a quarter; it is built over years of consistent, comparable, documented performance. The comparability matters as much as the consistency. Results documented in incompatible formats across periods cannot be read as a track record. They are a collection of moments. A genuine track record is a continuous and comparable sequence, allowing an evaluator to identify the pattern. Build the track record deliberately, document it consistently, and make it comparable across periods — then make sure it speaks in a language the market already knows how to read.",
  ], pull:"When you speak a language the market already knows how to read, you reduce the friction between evaluation and engagement." },
  { id:"ch10", type:"chapter" as const, part:"PART III — THE MESSAGE", num:"10", title:"The Shield", subtitle:"Protected by the floor", body:[
    "What happens to systems that attract capital before they have established a credible Bottom Line? Which terms do they accept? What power do they surrender? What long-term damage do they sustain in exchange for short-term access?",
    "The answer is stark. Systems operating without a demonstrated Bottom Line are structurally vulnerable to extractive capital. High-interest debt with punishing covenants, equity arrangements that dilute ownership far beyond fair value, conditional grants that create dependence rather than capacity, partnership terms that extract value over time while offering minimal reciprocal commitment.",
    "These are not anomalies or aberrations. They are the rational pricing of unverifiable risk by capital providers who have no other basis for their decision. When you have not demonstrated your floor, the capital provider must assume the worst. And when the worst is assumed, the terms reflect it. You pay — in interest rates, equity surrender, covenants, or conditions — for the uncertainty you have not yet resolved.",
    "Most systems that have accepted extractive terms did not know they were accepting them. They were grateful for the access. They did not yet have the framework to read what the terms were actually saying about how the capital provider had assessed them. And that absence of framework — the inability to read your own evaluation — is itself a consequence of the legibility gap.",
    "The Bottom Line changes this equation at its root. A system that has established a credible, legible floor is a system that has reduced the capital provider's uncertainty. And reduced uncertainty means reduced risk premium. It means better rates, fairer terms, less onerous conditions, more genuine partnership. It means the difference between capital that exploits and capital that builds.",
    "But the protection goes beyond pricing. It goes to power. A system with a credible Bottom Line can say no. It can reject the extractive offer because it has demonstrated to enough credible alternative providers that better terms are warranted. The Bottom Line is not just what gets you in the room. It is what gives you standing to negotiate once you are there.",
    "The systems that negotiate from standing have something the others do not. A better floor that arrived at the table before the negotiation began. It arrived in the form of the documents, the verifications, the track record, the signal — everything that told the capital provider, before a word was spoken, what they were dealing with. By the time the room is entered, the negotiation is largely already over. The floor has already set the terms.",
    "This is why the Bottom Line is not just a growth strategy. It is a sovereignty strategy. Hold the floor to ensure that the doors you open lead somewhere worth going.",
  ], pull:"The Bottom Line is not just a growth strategy. It is a sovereignty strategy." },
  { id:"ch11", type:"chapter" as const, part:"PART IV — THE STORIES", num:"11", title:"The Certified", subtitle:"Systems that held", body:[
    "The Bottom Line applies because every meaningful endeavor eventually becomes a system. A nation, a company, a club, an athlete, a career. At first, this feels strange. We prefer to think in terms of talent, ambition, vision, inspiration, leadership, moments. But moments do not sustain themselves. They either harden into systems or disappear into memory.",
    "This is the hidden pattern behind durable success across every field. The systems that rise are rarely the ones with the highest peaks. They are the ones that built the most credible floors. The ones that transformed isolated excellence into repeatable reliability. The ones that learned how to make trust legible.",
    "— RWANDA —",
    "After the 1994 genocide against the Tutsi, Rwanda faced a problem deeper than economic destruction. The country had lost institutional trust itself. The question facing Rwanda was not simply how to grow, but how to become legible again to a world that associated it primarily with collapse.",
    "At the beginning, Rwanda existed in the Tide. There was movement but little confidence from outside systems. Investors viewed the environment as uncertain, international institutions saw fragility. The gap between what Rwanda intended to become and what the world trusted it to be was immense.",
    "What followed over the next decades was not a miracle. The country focused on floors: good governance, infrastructure, efficiency, administrative order, institutional predictability, anti-corruption, ease of doing business, safety. None of these alone transformed Rwanda; the power came from consistency across time. The country made itself legible.",
    "A foreign investor arriving in Kigali encountered signals that aligned: organized infrastructure, predictable procedures, functional administration, visible state capacity. The market developed a calculable understanding of the country's floor. And once that happened, the relationship changed. Capital that avoids unpredictability began engaging, international partnerships expanded, tourism rose, global events arrived.",
    "The Kigali Convention Centre, the BK Arena, and the Amahoro Stadium are credibility infrastructure. Facilities capable of hosting the kinds of global events that only arrive where operational trust already exists — the Basketball Africa League Finals and the UCI Road World Championships. These events are not rewards for narrative. They are allocations of trust.",
    "Sustained GDP growth rates approaching 9.4% positioned Rwanda among Africa's leading growth economies, while the World Bank B-READY assessment ranked the country first in Africa for Regulatory Framework and Operational Efficiency. The country stopped being evaluated through the lens of trauma and began being evaluated through the lens of sustainable growth reliability.",
    "— MO IBRAHIM —",
    "Mo Ibrahim did not set out to prove a point about Africa. He set out to build a telecommunications company. But in doing so, he encountered a structural problem: the gap between what a system is and what the market's outdated model believes it to be.",
    "In the late 1990s, Mo Ibrahim was asking experienced telecommunications executives why they were ignoring the enormous opportunity to build mobile networks in Africa. Executives cited political instability as a barrier in countries that had been stable for a generation. They discounted entire consumer populations without data. They applied risk premiums built on fear rather than calculation. The market could not read Africa because it had not bothered to develop the framework to do so.",
    "Mo Ibrahim's response was not to argue. It was to build. Celtel's floor was constructed deliberately and in full public view. An experienced and respected board recruited to transfer credibility from established actors to a new context. Governance standards instituted from day one, not because regulation required them but because the market could not calculate a risk it could not verify. A no-bribery policy enforced absolutely across thirteen countries, each of which the conventional wisdom had classified as environments where such standards were impossible to hold.",
    "The floor was real, it was legible, and it was held. By the time Celtel was sold, the company had 5.2 million customers and operations in 13 countries, with revenue of $614 million and a $147 million net profit. The transaction at $3.4 billion — one of the largest African business deals ever completed — was not a surprise to Mo Ibrahim. It was a surprise to every investor who had declined to fund him. Because the sale did not just reward Mo Ibrahim. It invalidated the model.",
    "What followed the sale is the Responsibility principle made institutional. The Mo Ibrahim Foundation. The Ibrahim Index of African Governance — the most rigorous annual assessment of governance quality across the continent, designed explicitly to make African institutional quality legible in the language that global capital uses to make decisions. The Ibrahim Prize, the largest individual prize in the world, awarded to African Heads of State who govern well and transfer power peacefully.",
    "Mo Ibrahim built a floor; the market acknowledged it. Then he spent the rest of his career building the infrastructure that would allow every system coming after him to build theirs more credibly.",
    "— ATLÉTICO DE MADRID —",
    "For much of modern football history, Atlético de Madrid lived in the shadow of more globally dominant clubs. The club could produce strong seasons, but isolated strong seasons are not a Bottom Line. What transformed Atlético was not one championship. It was the construction of an identity-level floor, raised simultaneously across every dimension of what a football club is.",
    "On the pitch, their floor is established by La Liga titles, by more than a decade of uninterrupted Champions League qualification, by a tactical identity, and by a youth academy that feeds the first team with a consistency that makes the club structurally independent of any single transfer window or any single star. Off the pitch, the floor is established by a financial model as disciplined as Simeone's defensive structure. When their rivals were accumulating debt, Atlético were building sustainability.",
    "The Metropolitano stadium — a 70,000-capacity venue built to the highest standards of fan experience — and the upcoming 'Ciudad Del Deporte' project, a sport-city designed to make the stadium's neighborhood the most complete sports and entertainment destination in Europe: hotels, retail, training facilities, academies, sports medicine infrastructure, cultural spaces, all integrated into a single destination that generates value continuously, not just on match days.",
    "Atlético's answer to that question — built over more than a decade while maintaining competitive excellence and grassroots rigor simultaneously — is the most complete demonstration in football that the Bottom Line is not one thing. It is every dimension of a system raised together, held together, and compounded together.",
    "— PARIS SAINT-GERMAIN —",
    "Paris Saint-Germain had spent decades as one of European football's most visible clubs without ever entering its most exclusive conversation. The trophies were real. The ambition was genuine. Ligue 1 titles accumulated, domestic cups were won. They had the resources, the stadium, the market, and the stars. They made fans dream bigger. But the UCL remained out of reach.",
    "Because the UCL does not reward resources. It does not reward names. It rewards the most credible floor — the team that performs with the most cohesion, the most tactical consistency, and the most collective reliability under the highest pressure the game can generate. PSG's structure, built around individual stars rather than collective systems, collapsed precisely when those conditions arrived. PSG had been building peaks. What they needed was a floor.",
    "Then came the 2023 unpopular realignment. Removing the stars, the names that had defined the club's identity — felt like a retreat to supporters who had been promised the summit. The media read it as failure. The fans read it as surrender. The club read it as the only decision that made sense.",
    "What followed was the quiet, unglamorous, systematic construction of a collective floor. Not a listing of names but an association of skills. Not individual brilliance but structural reliability. A team that held its standard not because of who was on the pitch but because of how the system functioned when the pressure was highest.",
    "In 2025, PSG won their first European Champions League with the largest winning margin in the history of the final. The score was not a statement of talent. It was a statement of floor. The following season they defended it, becoming the first French club in history to win the Champions League twice, and the second European club to achieve back-to-back titles in the modern era.",
    "PSG did not reach the Court of Giants by dreaming bigger. They reached it by building deeper.",
    "— SAMSUNG —",
    "Samsung is one of the clearest corporate examples of the Commitment. In the 1990s, Samsung faced a structural perception problem. The company was large, capable, and productive, but globally it was still often viewed as a lower-tier manufacturer competing primarily on cost rather than quality.",
    "Then came Lee Kun-hee's declaration: 'Change everything.' The statement mattered because it represented more than strategy. It represented identity rupture. Samsung drew a visible line in history. The company invested heavily in design, engineering, quality control, global benchmarking, manufacturing excellence, research infrastructure, brand positioning. Most importantly, it held the standard long enough for the market to update its model.",
    "Over time, Samsung's floor rose high enough that global consumers no longer evaluated the company as a speculative alternative. The company became trusted at the highest level of electronics manufacturing. The transition from 'capable' to 'trusted' is the crossing. And once the crossing happens, scale compounds dramatically because the friction of doubt decreases.",
    "— FAITH KIPYEGON —",
    "Faith Kipyegon is often discussed through the language of brilliance. World records, Olympic titles, historic performances. But brilliance alone does not explain sustained dominance. The deeper explanation is architectural.",
    "Kipyegon's greatness rests on an extraordinary competitive floor. Championship races are psychologically violent environments. Tactics shift, pace changes, pressure rises and bodies fail under stress. Yet over years, across Olympic finals, World Championships, and elite competitions, one pattern became increasingly undeniable: her minimum standard remained very high.",
    "The market trusts her because her floor became predictable at the highest level of sport. Many athletes can briefly touch greatness. Very few can inhabit it consistently enough that the world begins assuming excellence before the race even begins. At that point, reputation changes competitive psychology. And sponsors, competitors, audiences and history react differently.",
    "This is ultimately the pattern beneath every enduring form of success: the transformation of isolated performance into trusted continuity. That is the Bottom Line.",
  ], pull:"The systems that rise are rarely the ones with the highest peaks. They are the ones that built the most credible floors." },
  { id:"ch12", type:"chapter" as const, part:"PART V — THE SEQUENCE", num:"12", title:"The Audit", subtitle:"Your baseline", body:[
    "Most systems, when asked to assess themselves, produce a document that looks like a highlight reel. The best quarters, the strongest results, the achievements that support the conclusion they have already reached about themselves. This is not an audit; it is a press release.",
    "The Audit begins in the opposite direction. Not from the conclusion backward, but from the uncomfortable questions forward. What has the pattern of your behavior revealed about your actual priorities, as opposed to your stated ones? Where did you hold your standard when holding it cost you something real? Where did you let it slip when no one was watching, and what does that tell you about whether the standard is structural or performative?",
    "What is the gap between your best performance and your consistent minimum, and what does that gap reveal about the reliability of your floor? These questions are not designed to diminish you. They are designed to show you where your foundation is, so you can build from it, honestly, rather than from an imaginary version of it.",
    "Most self-assessments are constructed backward. The system decides what it wants to conclude about itself, then selects the evidence that supports that conclusion. The favorable quarters are foregrounded, the difficult periods are explained, the gaps are bridged by narrative, and the result is a document that feels like an assessment but functions like a defense. The Audit strips the defense. It asks what you did, consistently, across the full record — including the periods that did not make the presentation.",
    "The gap between the curated record and the complete record is the first thing the Audit finds. And that gap, measured honestly, is the distance between the floor you claim and the floor you hold.",
    "The second question the Audit asks is harder, because it does not reveal weakness, it reveals dependency. Would what you have built, hold its standard without you? Not in theory, in practice. If you stepped away, if the founder left, if the leader changed, if the key person was no longer present, would the floor hold? The systems that have genuinely built a Bottom Line answer yes. Not because they are absent from what they built, but because what they built does not require their continuous presence to maintain its minimum. A floor that exists only in the energy of one person is not a floor; it is a performance.",
    "The third question concerns legibility. Of everything your system does consistently, how much of it exists in a form that a stranger could verify without your narration? The talent developed but never documented, the quality delivered but never audited, the commitment honored but never recorded — all of it is real. None of it is a trust signal. The Audit reveals the distance between the floor you have built and the floor the market can read, and that distance is almost always larger than expected.",
    "The fourth question is the generative one. Given what the previous questions have revealed — the actual floor, the dependency within it, the legibility gap around it — what does your real position demand of you next? Not what you wish your position were. What does the honest picture of where you stand make unavoidable as a next priority?",
    "The Audit produces three outputs simultaneously. The honest baseline: the actual floor, stripped of narrative, stated in terms a stranger could verify. The gap analysis: the distance between the floor you hold, and the floor required to access what you are seeking. And the strategic alignment: the specific, prioritized sequence that closes the gap without pretending it does not exist.",
    "Systems do not rise to the level of their stated ambition. They rise to the level of their documented behavior. The Audit is the most generous thing a system can do for itself. Because a system that knows its actual position can build from it. A system that builds from an imagined position will eventually encounter the gap between what it believed about itself and what the market has always known.",
  ], pull:"Systems do not rise to the level of their stated ambition. They rise to the level of their documented behavior." },
  { id:"ch13", type:"chapter" as const, part:"PART V — THE SEQUENCE", num:"13", title:"The Commitment", subtitle:"The State-of-the-Art act", body:[
    "The Commitment is not a plan. Plans can be revised, delayed, and quietly abandoned. The Commitment is a declaration. The moment a system draws a line in its own history and says: Below this, never again.",
    "The Commitment works this way because it changes not what the system does but what the system is. And identity is more durable than discipline. The distinction is not semantic. It is the difference between a system that is trying to improve and a system that has decided what it is. Trying to improve is a posture of uncertainty — the system is still negotiating with itself about whether the new standard is worth the cost. Having decided what it is, leaves no negotiation available. The standard is not a goal being pursued. It is an identity being expressed.",
    "This is why the Commitment is the State-of-the-Art act. In its truest sense, state of the art does not describe the most recent version. It describes the highest current expression of what is possible. When a system makes a genuine Commitment, it is not announcing an intention. It is declaring a new present. Not what it will become, what it now is.",
    "The Commitment has three requirements to be genuine rather than performative. It must be specific. Not 'We are raising our standards' but 'We will hold this exact measurable minimum from this exact date forward.' Specific enough that in twelve months, there is no ambiguity about whether it has been held. It must be costly. A commitment that requires no sacrifice signals no real change. The market reads commitment through the evidence of what was surrendered to make it, not through the eloquence of the announcement. The hundreds of millions of dollars of inventory Samsung burned in car parks across South Korea was not symbolism. It was accountability made physical, the most visible possible proof that the declaration was not a presentation but a conversion. And it must be public. A commitment made only to yourself is motivation. A commitment made to your market, your stakeholders, your community is accountability. Accountability is what converts aspiration into architecture.",
    "The Commitment is the hardest of the four movements in one specific way: it is the only one that requires a before and an after. The Audit revealed the actual floor. The Commitment draws the line above it. And the distance between those two points — between where you honestly are and where you are now declaring you will not fall below — is the exact measure of what the Commitment demands of you.",
    "A business that has committed to audited governance faces the first invoice from the audit firm and must decide whether the commitment was real. A federation that has committed to certified coaching at every level faces the first coach who resists the certification and must decide whether the standard has exceptions. An individual who has committed to documenting every outcome verifiably faces the first opportunity to present themselves through narrative instead and must decide whether the floor applies when it is inconvenient. These are not dramatic moments. They are the moments where the Commitment either becomes structural or reveals itself as aspirational.",
    "The Commitment is also an act of respect toward everyone who will engage with the system in the future. The entrepreneur who commits to audited governance is telling her future investors what they can count on. The federation that commits to grassroots standards is telling the next generation of players what the system owes them. The policymaker who embeds institutional commitments in durable structural form is telling the citizens of the next government what the state owes them regardless of who governs it.",
    "The line you draw is the system you become.",
  ], pull:"Below this, never again." },
  { id:"ch14", type:"chapter" as const, part:"PART V — THE SEQUENCE", num:"14", title:"The Practice", subtitle:"A lifestyle", body:[
    "When journalists ask elite performers about the discipline required to maintain their standard, the most revealing answers are the ones that register genuine confusion at the question. Discipline suggests a gap between what you want to do and what you make yourself do. At the level of true Practice, that gap does not exist. The standard is not imposed from outside. It is generated from inside.",
    "Most frameworks for excellence treat Practice as the mechanism of discipline — the daily repetition that compensates for the gap between current capability and desired capability. This is a useful way to think about development. It is not how mastery works. Mastery is not the sustained application of discipline to close a gap. It is the disappearance of the gap. The standard that once required effort to hold becomes the thing the system cannot imagine not holding. Because holding it is no longer a choice. It is an expression.",
    "This distinction matters strategically because the market can feel the difference between a floor that is held by discipline and a floor that is held by identity. The disciplined floor is contingent — it depends on the system's energy, attention, and motivation being sufficient to override the competing pressures that are always present. The identity floor is not contingent. It is what the system does when it is not thinking about it, when conditions are difficult, when no one is watching, when the short-term cost of holding the standard is higher than the cost of slipping. The market calls this reliability. The system that has reached it, calls it simply: \"Me.\"",
    "The Practice does not announce itself. It is visible in the texture of ordinary decisions — the ones made without drama, without deliberation, without the conscious application of values to circumstances. The records kept without being asked for, the standards held without being monitored, the commitments honored without the presence of the people to whom they were made.",
    "The coach who certifies every youth program instructor not because a federation audit is coming but because uncertified coaching is beneath what this system is. The business that produces audited accounts not because an investor requires them but because informal records are no longer consistent with the organization's understanding of itself. The artist who registers every work on the day of release not because a lawyer insisted but because releasing without registering now feels like releasing without finishing. The policymaker who enforces the institutional standard in the low-visibility case — the one that will never make a headline — because that is precisely where the floor is actually set.",
    "These are not heroic acts. They are the Practice. The daily, automatic, identity-level expression of a standard that has been so fully inhabited that it no longer requires a decision. This is also where the Practice becomes its own protection. A system that holds its floor by discipline is vulnerable to the moment when discipline falters — when the pressure is high, the resources are thin, or the audience is absent. A system that holds its floor by identity has no such vulnerability, because the floor is not a choice being renewed each day. It is the baseline from which every decision is made.",
    "Disruption, difficulty, and adversity do not test whether the system will hold its standard. They reveal that the standard was never contingent on favorable conditions to begin with. This is what the market is measuring when it assigns trust over time — not whether the system performed well when things were easy, but whether the floor held when they were not.",
    "The Practice is how the Bottom Line becomes permanent. Not through surveillance and enforcement, but through identity and expression. The system that has defined its Practice does not maintain its floor. It inhabits it. And a system that inhabits its floor is a system the market trusts not because of what it has promised but because of what it demonstrably, consistently, identity-level is.",
  ], pull:"The market calls this reliability. The system that has reached it calls it simply: \"Me.\"" },
  { id:"ch15", type:"chapter" as const, part:"PART V — THE SEQUENCE", num:"15", title:"The Raise", subtitle:"Compound effect", body:[
    "Watch what happens to an athlete who has spent four years building and holding a training floor that most competitors consider excessive. They do not one day decide to compete at a higher level. The higher level becomes the only level commensurate with what they have built. The floor has risen not because they chose to raise it but because the consistent practice of holding it has made the previous ceiling inadequate.",
    "This is the nature of the Raise: it is not imposed from above as ambition. It is generated from below as the inevitable consequence of compound consistency. And when it arrives — when the system recognizes that its current floor is not the limit of what it can hold but merely the starting point for what comes next — everything that built the floor must now be recalibrated. The Audit must happen again, from the new position. The Commitment must be restated, at the new level. The Practice must express the new standard.",
    "The Raise is not a decision you make. It is the reaction that happens to a system that has fully inhabited its Practice. This distinction matters because most systems experience the Raise as ambition — as the imposition of a new, higher demand on a system that has become comfortable at the current level. This experience is the sign that the previous floor was held by discipline rather than identity.",
    "A system that holds its floor by identity does not experience the Raise as imposition. It experiences it as recognition — the moment it becomes obvious that the floor it has been inhabiting is now the floor that others are trying to reach, and that the next floor is the natural next expression of what it already is.",
    "The Raise has a specific structural requirement that is often misunderstood. It does not replace the previous floor; it elevates and recalibrates it. The Raise also changes the composition of competition. When a system raises its floor, it does not just move further from the systems below it. It enters a new category of encounter with the systems already operating at the higher level. This is the Ascent horizon — the moment when the gap between the system's floor and the very best available becomes the primary strategic challenge, rather than the gap between the system's floor and credibility.",
    "This is not a linear journey with a destination. It is the ongoing, compounding, identity-deepening work of a system that has decided to take itself seriously and discovered that taking itself seriously is not a constraint at all. It is the most expansive thing a system can do.",
  ], pull:"The Raise is not a decision you make. It is the reaction that happens to a system that has fully inhabited its Practice." },
  { id:"ch16", type:"chapter" as const, part:"PART V — THE SEQUENCE", num:"16", title:"The Heights", subtitle:"Meet the top", body:[
    "In the Tide, the fight is to survive. To stay in the game long enough for the game to notice you at all. Every setback feels existential because the floor is still fragile. One failed season, one lost investor, one injury, one bad contract, one public mistake — at that level, systems do not yet possess enough accumulated trust for the market to separate fluctuation from collapse. Every loss threatens identity because identity itself is still unstable.",
    "Then comes the Milestone. The period where the system is no longer fighting merely to exist, but to be believed. The battle becomes one of credibility — with documentation, proof and translation. The work of making the floor visible enough for serious audiences to engage with confidence.",
    "But eventually, when the Bottom Line is built strongly enough — when the floor becomes high enough, legible enough, and consistently held long enough — the system enters a different reality entirely. The Ascent. And the Ascent changes everything as the battle is no longer for access but for position. From 'Do you belong here?', the question becomes: 'How far can you go?'",
    "This is the level where volatility stops feeling existential. A difficult quarter becomes a problem to solve rather than a referendum on survival. A championship loss becomes part of elite competition rather than evidence that the system was fraudulent all along. The market understands the difference because the market now understands the floor.",
    "This is one of the great hidden rewards of the Bottom Line: the serenity. Not ease, but the psychological stability that comes from no longer needing, every single moment, to prove your right to exist. Ascent-level systems experience pressure differently because they experience identity differently. Difficulty is no longer interpreted as rejection. It is interpreted as competition at the level they earned the right to occupy.",
    "The Ascent also changes the quality of relationships available to the system. In the Tide, relationships are often structured around doubt. Capital arrives cautiously; partnerships contain layers of surveillance and control. The stronger side manages the perceived risk of the weaker one. In the Ascent, the structure changes and credible systems engage each other differently. Negotiations become partnerships rather than supervision. Access becomes faster, friction decreases. Trust lowers transaction costs. Opportunity compounds because the market no longer spends most of its energy trying to verify whether the system is real.",
    "The greatest danger of the Ascent is not failure but comfort. The urgency that built the floor begins to fade, and the practices that once felt essential start to feel optional. Governance becomes bureaucracy. Documentation becomes administration. Discipline becomes overhead. Yet the market does not reward past credibility indefinitely. Trust is continuously renewed, not permanently granted. When a system allows its floor to soften, it is not judged by what it once was but by what it consistently demonstrates now.",
    "The future will not be built around the extraordinary few who occasionally reach impossible peaks. It will be built around systems that learned how to create trusted floors at scale and maintain them. The real infrastructure of global growth.",
  ], pull:"The serenity — not ease, but the psychological stability that comes from no longer needing to prove your right to exist." },
  { id:"ch17", type:"chapter" as const, part:"PART VI — THE CONCLUSION", num:"17", title:"The Line", subtitle:"Lift it up", body:[
    "Every system has a story. Every system has ambitions. But markets do not allocate opportunity to stories. They allocate opportunity to trust. Trust is not built through declarations but through evidence. Not through moments but through records. Not through potential but through proof. Not through peaks but through floors.",
    "The systems that rise are the ones that make belief rational. Every system — the entrepreneur, the athlete, the club, the company, the institution, the nation — eventually arrives at the same place. The line between what it claims and what it can demonstrate. The line between being capable and being trusted. The line between aspiration and allocation.",
    "The difference is rarely talent. The difference is whether they chose to build the infrastructure of trust before demanding the rewards of it.",
    "Potential is common but trust is scarce.",
  ], pull:"Potential is common. Trust is scarce." },
];

/* ── Screen model ────────────────────────────────────────────── */
type Screen =
  | { kind: "cover" }
  | { kind: "intro";    id: string }
  | { kind: "concept";  id: string }
  | { kind: "para";     id: string; text: string; idx: number; total: number }
  | { kind: "takeaway"; id: string }
  | { kind: "end" };

const SCREENS: Screen[] = (() => {
  const s: Screen[] = [{ kind: "cover" }];
  for (const ch of CHAPTERS) {
    if (ch.type !== "chapter") continue;
    s.push({ kind: "intro", id: ch.id });
    if (CONCEPTS[ch.id]) s.push({ kind: "concept", id: ch.id });
    ch.body.forEach((text, idx) =>
      s.push({ kind: "para", id: ch.id, text, idx, total: ch.body.length })
    );
    if (ch.pull) s.push({ kind: "takeaway", id: ch.id });
  }
  s.push({ kind: "end" });
  return s;
})();

const TOTAL = SCREENS.length;

/* ── Narration timing estimate ───────────────────────────────────
   No word-level timestamps are available from TTS, so each paragraph's
   start is estimated as its cumulative share of chapter text length.
   Good enough to keep reading and listening roughly aligned; not
   frame-accurate. */
function paragraphStartFractions(body: string[]): number[] {
  const lens = body.map(p => p.length);
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return lens.map(l => { const f = acc / total; acc += l; return f; });
}

/* Split chapter paragraphs into ≤limit-char groups (never mid-paragraph)
   so long chapters can be synthesized as multiple TTS calls and stitched
   into one continuous track instead of being truncated. */
function chunkParagraphs(body: string[], limit = 7000): string[][] {
  const chunks: string[][] = [];
  let current: string[] = [];
  let len = 0;
  for (const p of body) {
    if (current.length && len + p.length > limit) {
      chunks.push(current);
      current = [];
      len = 0;
    }
    current.push(p);
    len += p.length + 2;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

/* Concatenate WAV blobs returned by /api/tts into one playable WAV
   (strip each 44-byte header, keep the first, recompute sizes). */
async function concatWavBlobs(blobs: Blob[]): Promise<Blob> {
  if (blobs.length === 1) return blobs[0];
  const buffers = await Promise.all(blobs.map(b => b.arrayBuffer()));
  const HEADER = 44;
  const pcmParts = buffers.map(buf => new Uint8Array(buf, HEADER));
  const totalPcmLen = pcmParts.reduce((n, p) => n + p.length, 0);
  const first = new DataView(buffers[0]);
  const sampleRate = first.getUint32(24, true);
  const channels = first.getUint16(22, true);
  const bitsPerSample = first.getUint16(34, true);
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = new ArrayBuffer(HEADER);
  const view = new DataView(header);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + totalPcmLen, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, totalPcmLen, true);
  return new Blob([header, ...pcmParts], { type: "audio/wav" });
}

/* ── Small shared pieces ─────────────────────────────────────── */
function DownloadPill({ state, onClick }: { state: DownloadState; onClick: () => void }) {
  if (state === "downloading")
    return <span className="au-dl"><span className="au-dl__ring" />Saving</span>;
  if (state === "done")
    return (
      <span className="au-dl is-done">
        <svg viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Saved offline
      </span>
    );
  return (
    <button className="au-dl" onClick={onClick}>
      <svg viewBox="0 0 16 16" fill="none"><path d="M8 2v8M8 10 5 7M8 10l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 13h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
      Download
    </button>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="au-empty">
      <div className="au-empty__mark">&ldquo;</div>
      <p className="au-empty__text">{label}</p>
    </div>
  );
}

/* ── Reader ──────────────────────────────────────────────────── */
export default function TheBottomLine() {
  const [si, setSi]         = useState(0);
  const [menuOpen, setMenu]   = useState(false);
  const [dark, setDark]       = useState(false);
  const [playing, setPlaying]     = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDur,  setAudioDur]  = useState(0);
  const [audioErr, setAudioErr]   = useState(false);
  const [rate, setRate]           = useState(1);
  /* on-demand narration (text-to-speech) */
  const [audioUrl, setAudioUrl]   = useState<string | null>(null);
  const [synth, setSynth]         = useState<"idle" | "loading" | "ready" | "error">("idle");

  /* listen experience */
  const [mode, setMode]           = useState<"read" | "listen">("read");
  const [listenTab, setListenTab] = useState<"listen" | "podcast">("listen");
  const [notes, setNotes]             = useState<Note[]>([]);
  const [highlights, setHighlights]   = useState<Highlight[]>([]);
  const [bookmarks, setBookmarks]     = useState<Bookmark[]>([]);
  const [progress, setProgress]       = useState<Record<string, Progress>>({});
  const [downloads, setDownloads]     = useState<Record<string, DownloadState>>({});
  const [libOpen, setLibOpen]         = useState(false);
  const [libTab, setLibTab]           = useState<"notes" | "highlights" | "bookmarks">("notes");
  const [composer, setComposer]       = useState<
    null | { kind: "note" | "highlight"; chId: string; t: number; text: string }
  >(null);
  const [shareTarget, setShareTarget] = useState<
    null | { text: string; chapterTitle: string | null }
  >(null);

  /* podcast preview playback (spoken preview of each episode blurb) */
  const [podPlaying, setPodPlaying] = useState<string | null>(null);
  const [podState, setPodState]     = useState<Record<string, "idle" | "loading" | "error">>({});

  const touchX        = useRef(0);
  const audioRef      = useRef<HTMLAudioElement>(null);
  const pendingSeek   = useRef<number | null>(null);
  const progressRef   = useRef<Record<string, Progress>>({});
  const audioTimeRef  = useRef(0);
  const audioDurRef   = useRef(0);
  const narrationCache = useRef<Map<string, string>>(new Map());
  const playAfterLoad  = useRef(false);
  const chIdRef        = useRef<string | null>(null);
  const syncFromAudio   = useRef(false);
  const synthInFlight   = useRef<Set<string>>(new Set());
  const podAudioRef     = useRef<HTMLAudioElement | null>(null);
  const podCache        = useRef<Map<string, string>>(new Map());

  const goNext = useCallback(() => setSi(i => Math.min(i + 1, TOTAL - 1)), []);
  const goPrev = useCallback(() => setSi(i => Math.max(i - 1, 0)), []);

  /* keyboard */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goPrev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev]);

  /* theme — saved preference, else system; applied pre-paint by the
     route layout script. This only syncs React state to what is already
     on <html>, so there is no flash. */
  useEffect(() => {
    let t = document.documentElement.getAttribute("data-theme");
    if (t !== "dark" && t !== "light") {
      try { t = localStorage.getItem("tbl-theme"); } catch { t = null; }
      if (t !== "dark" && t !== "light") {
        t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      document.documentElement.setAttribute("data-theme", t);
    }
    setDark(t === "dark");
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    const value = next ? "dark" : "light";
    /* Suppress transitions for the single frame of the switch so the
       theme applies instantly and cleanly (also sidesteps a Chromium
       repaint glitch with var()-driven transitions). Hover/interaction
       animations are untouched outside this frame. */
    const style = document.createElement("style");
    style.appendChild(
      document.createTextNode("*,*::before,*::after{transition:none !important}")
    );
    document.head.appendChild(style);
    document.documentElement.setAttribute("data-theme", value);
    try { localStorage.setItem("tbl-theme", value); } catch { /* ignore */ }
    window.getComputedStyle(document.body).opacity; // force reflow
    requestAnimationFrame(() => style.remove());
    setDark(next);
  };

  const screen    = SCREENS[si];
  const chId      = screen.kind !== "cover" && screen.kind !== "end" ? screen.id : null;
  const chapter   = chId ? CHAPTERS.find(c => c.id === chId) ?? null : null;
  const readProgress = si / (TOTAL - 1);

  const chapterList  = CHAPTERS.filter(c => c.type === "chapter");
  const chapterIdx   = chId ? chapterList.findIndex(c => c.id === chId) : -1;
  const nextChapter  = chapterIdx >= 0 ? chapterList[chapterIdx + 1] ?? null : null;
  const audioDefined = !!(chId && AUDIO[chId]);
  const audioReady   = audioDefined && !audioErr;
  const playedChapters = chapterList.filter(c => (progress[c.id]?.t ?? 0) > 5).length;

  const jumpTo = (id: string) => {
    const idx = SCREENS.findIndex(s => s.kind === "intro" && s.id === id);
    if (idx >= 0) setSi(idx);
    setMenu(false);
  };

  /* load the local-first library once */
  useEffect(() => {
    setNotes(loadJSON<Note[]>(K.notes, []));
    setHighlights(loadJSON<Highlight[]>(K.highlights, []));
    setBookmarks(loadJSON<Bookmark[]>(K.bookmarks, []));
    setDownloads(loadJSON<Record<string, DownloadState>>(K.downloads, {}));
    setRate(loadJSON<number>(K.rate, 1));
    const p = loadJSON<Record<string, Progress>>(K.progress, {});
    progressRef.current = p;
    setProgress(p);
  }, []);

  const commitProgress = useCallback((id: string, t: number, dur: number) => {
    const p = { ...progressRef.current, [id]: { t, dur, updatedAt: Date.now() } };
    progressRef.current = p;
    setProgress(p);
    saveJSON(K.progress, p);
  }, []);

  /* audio — reset transport when the chapter changes */
  useEffect(() => {
    const el = audioRef.current;
    if (el) { el.pause(); el.currentTime = 0; el.playbackRate = rate; }
    setPlaying(false);
    setAudioTime(0);
    setAudioDur(0);
    setAudioErr(false);
    audioTimeRef.current = 0;
    playAfterLoad.current = false;
    const cached = chId ? narrationCache.current.get(chId) : undefined;
    setAudioUrl(cached ?? null);
    setSynth(cached ? "ready" : "idle");
  }, [chId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { chIdRef.current = chId; }, [chId]);

  /* on-demand narration: synthesize via /api/tts when no static file
     exists for this chapter (audioErr fires once the static src 404s) */
  const synthesizeNarration = useCallback(async (id: string) => {
    const cached = narrationCache.current.get(id);
    if (cached) {
      setAudioUrl(cached);
      setAudioErr(false);
      setSynth("ready");
      return;
    }
    if (synthInFlight.current.has(id)) return;
    const ch = CHAPTERS.find(c => c.id === id);
    if (!ch || !ch.body.length) { if (chIdRef.current === id) setSynth("error"); return; }

    synthInFlight.current.add(id);
    if (chIdRef.current === id) setSynth("loading");
    try {
      const groups = chunkParagraphs(ch.body);
      const blobs: Blob[] = [];
      for (const group of groups) {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: group.join("\n\n") }),
        });
        if (!res.ok) throw new Error("tts failed");
        blobs.push(await res.blob());
      }
      const combined = await concatWavBlobs(blobs);
      const url = URL.createObjectURL(combined);
      narrationCache.current.set(id, url);
      if (chIdRef.current === id) {
        setAudioUrl(url);
        setAudioErr(false);
        setSynth("ready");
      }
    } catch {
      if (chIdRef.current === id) setSynth("error");
    } finally {
      synthInFlight.current.delete(id);
    }
  }, []);

  /* kick off synthesis once we know the static file is missing */
  useEffect(() => {
    if (audioErr && chId && synth === "idle") synthesizeNarration(chId);
  }, [audioErr, chId, synth, synthesizeNarration]);

  /* seek the track to the estimated start of whatever passage the reader
     is currently on (used when playback begins fresh, so listening starts
     where the eye already is rather than at 0:00) */
  const alignAudioToScreen = useCallback((dur: number) => {
    const scr = SCREENS[si];
    if (scr.kind !== "para" || scr.id !== chId || !dur) return;
    const ch = CHAPTERS.find(c => c.id === chId);
    if (!ch) return;
    const starts = paragraphStartFractions(ch.body);
    const target = (starts[scr.idx] ?? 0) * dur;
    const el = audioRef.current;
    if (el && Math.abs(target - el.currentTime) > 2.5) {
      el.currentTime = target;
      setAudioTime(target);
      audioTimeRef.current = target;
    }
  }, [si, chId]);

  /* auto-play once narration finishes loading, if Play was pressed early */
  useEffect(() => {
    if (synth === "ready" && playAfterLoad.current) {
      playAfterLoad.current = false;
      const el = audioRef.current;
      if (!el) return;
      const start = () => {
        alignAudioToScreen(el.duration || audioDurRef.current);
        el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      };
      if (el.readyState >= 1 && el.duration) start();
      else el.addEventListener("loadedmetadata", start, { once: true });
    }
  }, [synth, audioUrl, alignAudioToScreen]);

  /* persist listening position when leaving a chapter */
  useEffect(() => {
    return () => {
      if (chId && audioTimeRef.current > 1) {
        commitProgress(chId, audioTimeRef.current, audioDurRef.current);
      }
    };
  }, [chId, commitProgress]);

  /* keep playback rate applied to the element */
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate, chId]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el || !chId) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      commitProgress(chId, el.currentTime, el.duration || audioDur);
    } else if (audioReady) {
      if (el.currentTime < 0.5) alignAudioToScreen(el.duration || audioDur);
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else if (synth !== "loading") {
      playAfterLoad.current = true;
      synthesizeNarration(chId);
    }
  };

  const skip = (s: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(audioDur || el.duration || 0, el.currentTime + s));
  };

  const seekTo = (t: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = t;
    setAudioTime(t);
    audioTimeRef.current = t;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioDur) return;
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(ratio * audioDur);
  };

  /* reading follows listening: while playing, advance the passage on
     screen to match the estimated narration position */
  useEffect(() => {
    if (!playing || !chId || !audioDur) return;
    const ch = CHAPTERS.find(c => c.id === chId);
    if (!ch || !ch.body.length) return;
    const starts = paragraphStartFractions(ch.body);
    const frac = audioTime / audioDur;
    let idealIdx = 0;
    for (let i = 0; i < starts.length; i++) if (frac + 1e-6 >= starts[i]) idealIdx = i;
    const wantIdx = SCREENS.findIndex(s => s.kind === "para" && s.id === chId && s.idx === idealIdx);
    if (wantIdx < 0 || wantIdx === si) return;
    const cur = SCREENS[si];
    const onThisChapter =
      (cur.kind === "para" || cur.kind === "intro" || cur.kind === "concept") && cur.id === chId;
    if (onThisChapter) {
      syncFromAudio.current = true;
      setSi(wantIdx);
    }
  }, [audioTime, playing, chId, audioDur]); // eslint-disable-line react-hooks/exhaustive-deps

  /* listening follows reading: turning the page (tap/swipe/keys/drawer)
     seeks the audio to that passage's estimated start */
  useEffect(() => {
    if (syncFromAudio.current) { syncFromAudio.current = false; return; }
    const scr = SCREENS[si];
    if (scr.kind !== "para" || scr.id !== chId || !audioDur) return;
    const ch = CHAPTERS.find(c => c.id === chId);
    if (!ch) return;
    const starts = paragraphStartFractions(ch.body);
    const target = (starts[scr.idx] ?? 0) * audioDur;
    if (Math.abs(target - audioTimeRef.current) > 2.5) seekTo(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [si]);

  const cycleRate = () => {
    const idx  = RATES.indexOf(rate as (typeof RATES)[number]);
    const next = RATES[(idx + 1) % RATES.length];
    setRate(next);
    saveJSON(K.rate, next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  /* podcast preview — synthesize and play a short spoken preview of the
     episode blurb (the full conversation isn't produced yet, so this is
     clearly framed as a preview, not the episode). */
  const togglePodcast = useCallback(async (ep: (typeof PODCAST)[number]) => {
    let el = podAudioRef.current;
    if (!el) { el = new Audio(); podAudioRef.current = el; }

    if (podPlaying === ep.id) {           // pause the currently-playing preview
      el.pause();
      setPodPlaying(null);
      return;
    }

    el.pause();                            // stop any other preview first
    if (audioRef.current && playing) { audioRef.current.pause(); setPlaying(false); }

    const cached = podCache.current.get(ep.id);
    const start = (url: string) => {
      el!.src = url;
      el!.onended = () => setPodPlaying(null);
      el!.play().then(() => setPodPlaying(ep.id)).catch(() => setPodPlaying(null));
    };
    if (cached) { start(cached); return; }

    setPodState(s => ({ ...s, [ep.id]: "loading" }));
    try {
      const preview = `${ep.title}. ${ep.blurb} This is a short preview. The full episode is in production.`;
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: preview }),
      });
      if (!res.ok) throw new Error("tts failed");
      const url = URL.createObjectURL(await res.blob());
      podCache.current.set(ep.id, url);
      setPodState(s => ({ ...s, [ep.id]: "idle" }));
      start(url);
    } catch {
      setPodState(s => ({ ...s, [ep.id]: "error" }));
    }
  }, [podPlaying, playing]);

  /* stop any podcast preview when leaving the podcast tab or the sheet */
  useEffect(() => {
    if (listenTab !== "podcast" || mode !== "listen") {
      podAudioRef.current?.pause();
      setPodPlaying(null);
    }
  }, [listenTab, mode]);

  /* library mutations — local-first, write-through to localStorage */
  const addNote = (text: string, t = audioTime) => {
    if (!chId || !text.trim()) return;
    const next: Note[] = [
      { id: uid(), chId, t, text: text.trim(), createdAt: Date.now() },
      ...notes,
    ];
    setNotes(next); saveJSON(K.notes, next);
  };
  const deleteNote = (id: string) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next); saveJSON(K.notes, next);
  };
  const addHighlight = (text: string, t = audioTime) => {
    if (!chId || !text.trim()) return;
    const next: Highlight[] = [
      { id: uid(), chId, t, text: text.trim(), createdAt: Date.now() },
      ...highlights,
    ];
    setHighlights(next); saveJSON(K.highlights, next);
  };
  const deleteHighlight = (id: string) => {
    const next = highlights.filter(h => h.id !== id);
    setHighlights(next); saveJSON(K.highlights, next);
  };
  const addBookmark = () => {
    if (!chId) return;
    const next: Bookmark[] = [
      { id: uid(), chId, t: audioTime, label: chapter?.title ?? "Bookmark", createdAt: Date.now() },
      ...bookmarks,
    ];
    setBookmarks(next); saveJSON(K.bookmarks, next);
  };
  const deleteBookmark = (id: string) => {
    const next = bookmarks.filter(b => b.id !== id);
    setBookmarks(next); saveJSON(K.bookmarks, next);
  };

  /* jump to a saved timestamp (seamless across chapters) */
  const jumpToStamp = (targetChId: string, t: number) => {
    setLibOpen(false);
    setMode("listen");
    if (targetChId === chId) {
      seekTo(t);
    } else {
      pendingSeek.current = t;
      const idx = SCREENS.findIndex(s => s.kind === "intro" && s.id === targetChId);
      if (idx >= 0) setSi(idx);
    }
  };

  /* real download with graceful fallback (caches the file when present) */
  const startDownload = async (id: string, src: string) => {
    setDownloads(prev => {
      const next = { ...prev, [id]: "downloading" as DownloadState };
      saveJSON(K.downloads, next); return next;
    });
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error("unavailable");
      if ("caches" in window) {
        const cache = await caches.open("tbl-audio");
        await cache.put(src, res.clone());
      }
      setDownloads(prev => {
        const next = { ...prev, [id]: "done" as DownloadState };
        saveJSON(K.downloads, next); return next;
      });
    } catch {
      /* file not yet published — revert so it can be retried later */
      setDownloads(prev => {
        const next = { ...prev, [id]: "idle" as DownloadState };
        saveJSON(K.downloads, next); return next;
      });
    }
  };

  /* export a branded share card as PNG (user-initiated) */
  const downloadShareCard = (svg: string) => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080; canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.drawImage(img, 0, 0); }
      URL.revokeObjectURL(url);
      canvas.toBlob(b => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = "the-bottom-line-quote.png";
        a.click();
        URL.revokeObjectURL(a.href);
      }, "image/png");
    };
    img.src = url;
  };

  /* helpers */
  const isStory    = (t: string) => /^—\s.+\s—$/.test(t.trim());
  const isElevated = (t: string) => t.length <= 115 && !t.endsWith(":") && !t.endsWith(",");

  return (
    <div
      className="bl-reader"
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 55) dx < 0 ? goNext() : goPrev();
      }}
    >
      {/* ── Topbar ── */}
      <div className="bl-topbar">
        <Link href="/books" className="bl-topbar__back">← Books</Link>
        <div className="bl-topbar__center">
          <span className="bl-topbar__label">
            {chapter?.num ? `${chapter.num} · ${chapter.title}` : "The Bottom Line"}
          </span>
        </div>
        <div className="bl-topbar__right">
          {chId && (
            <div className="au-seg" role="tablist" aria-label="Read or listen">
              <button
                className={`au-seg__btn${mode === "read" ? " is-active" : ""}`}
                onClick={() => setMode("read")}
                role="tab"
                aria-selected={mode === "read"}
              >Read</button>
              <button
                className={`au-seg__btn${mode === "listen" ? " is-active" : ""}`}
                onClick={() => setMode("listen")}
                role="tab"
                aria-selected={mode === "listen"}
              >Listen</button>
            </div>
          )}
          <button
            className="bl-topbar__dark"
            onClick={toggleTheme}
            aria-label={dark ? "Light mode" : "Dark mode"}
          />
          <button
            className={`bl-menu-icon${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenu(v => !v)}
            aria-label={menuOpen ? "Close contents" : "Open contents"}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="bl-progress">
        <div className="bl-progress__fill" style={{ width: `${readProgress * 100}%` }} />
      </div>

      {/* ── Contents overlay ── */}
      {menuOpen && (
        <div className="bl-drawer" onClick={() => setMenu(false)}>
          {/* Close button */}
          <button
            className="bl-drawer__close"
            onClick={() => setMenu(false)}
            aria-label="Close contents"
          >
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L18 18M18 2L2 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="bl-drawer__panel" onClick={e => e.stopPropagation()}>
            <p className="bl-drawer__head">CONTENTS</p>
            <div className="bl-drawer__list">
              {CHAPTERS.filter(c => c.type === "chapter").map((c, i) => (
                <button
                  key={c.id}
                  className={`bl-drawer__item${c.id === chId ? " is-active" : ""}`}
                  onClick={() => jumpTo(c.id)}
                  style={{ animationDelay: `${i * 22}ms` }}
                >
                  <span className="bl-drawer__num">{c.num ?? "·"}</span>
                  <span className="bl-drawer__title">{c.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Passage area ── */}
      <div className="bl-stage">
        {/* Tap zones */}
        <button className="bl-tap bl-tap--prev" onClick={goPrev} aria-label="Previous passage" tabIndex={-1} />
        <button className="bl-tap bl-tap--next" onClick={goNext} aria-label="Next passage"     tabIndex={-1} />

        {/* Passage — key={si} triggers re-animation each change */}
        <div key={si} className="bl-passage">

          {/* COVER */}
          {screen.kind === "cover" && (
            <div className="bl-cover">
              <div className="bl-cover__text">
                <p className="bl-cov__label">INGOGA LABS PRESENTS</p>
                <h1 className="bl-cov__title">THE BOTTOM LINE</h1>
                <p className="bl-cov__sub">Building Trusted Systems</p>
                <div className="bl-cov__source">
                  <span>THE AUTHOR</span>
                  <strong>Sheja Vallière</strong>
                  <p>Author and strategist writing on trust, evidence, and the systems that make progress durable.</p>
                </div>
                <button className="bl-cov__btn" onClick={goNext}>
                  <span className="bl-cov__btn-icon" aria-hidden="true">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 2.5L13.5 8 4 13.5V2.5Z" />
                    </svg>
                  </span>
                  BEGIN READING
                </button>
              </div>
              <div className="bl-cover__art">
                <img
                  src="/images/books/sheja-valliere-plate-v2.png"
                  alt="Portrait of Sheja Vallière"
                />
              </div>
            </div>
          )}

          {/* CHAPTER INTRO */}
          {screen.kind === "intro" && chapter && (
            <div className="bl-col">
              {chapter.part && <p className="bl-intro__part">{chapter.part}</p>}
              {chapter.num  && <span className="bl-intro__num">{chapter.num}</span>}
              <h2 className="bl-intro__title">{chapter.title}</h2>
              {chapter.subtitle && <p className="bl-intro__sub">{chapter.subtitle}</p>}
            </div>
          )}

          {/* CONCEPT — open typography, no card */}
          {screen.kind === "concept" && chapter && CONCEPTS[chapter.id] && (
            <div className="bl-col">
              <p className="bl-concept__label">CONCEPT INTRODUCED</p>
              <p className="bl-concept__name">{CONCEPTS[chapter.id].name}</p>
              <p className="bl-concept__def">{CONCEPTS[chapter.id].definition}</p>
            </div>
          )}

          {/* PARAGRAPH */}
          {screen.kind === "para" && (() => {
            const { text, idx, total } = screen;
            const story    = isStory(text);
            const elevated = !story && isElevated(text);
            const center   = story || elevated;
            return (
              <div className={`bl-col${center ? " bl-col--center" : ""}`}>
                {story    && <p className="bl-para--story">{text}</p>}
                {elevated && <p className="bl-para--big">{text}</p>}
                {!story && !elevated && <p className="bl-para">{text}</p>}
                <span className="bl-para__pos">{idx + 1} / {total}</span>
              </div>
            );
          })()}

          {/* KEY TAKEAWAY — open quotes, no box */}
          {screen.kind === "takeaway" && chapter?.pull && (
            <div className="bl-col bl-col--center">
              <p className="bl-take__label">KEY TAKEAWAY</p>
              <div className="bl-take__wrap">
                <span className="bl-take__mark" aria-hidden="true">"</span>
                <p className="bl-take__text">{chapter.pull}</p>
                <span className="bl-take__mark bl-take__mark--close" aria-hidden="true">"</span>
              </div>
            </div>
          )}

          {/* END */}
          {screen.kind === "end" && (
            <div className="bl-col bl-col--center">
              <p className="bl-end__label">THE END</p>
              <p className="bl-end__line">The line you draw<br />is the system you become.</p>
              <p className="bl-end__author">— Sheja Vallière</p>
              <div className="bl-end__links">
                <Link href="/books" className="bl-end__link">← Return to Books</Link>
                <Link href="/"      className="bl-end__link">Ingoga Labs ↗</Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Audio: persistent element + compact docked player ── */}
      {audioDefined && chId && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl ?? AUDIO[chId].src}
            preload="metadata"
            onTimeUpdate={e => { const t = e.currentTarget.currentTime; setAudioTime(t); audioTimeRef.current = t; }}
            onLoadedMetadata={e => {
              const d = e.currentTarget.duration;
              setAudioDur(d); audioDurRef.current = d;
              e.currentTarget.playbackRate = rate;
              if (pendingSeek.current != null) {
                e.currentTarget.currentTime = pendingSeek.current;
                setAudioTime(pendingSeek.current);
                pendingSeek.current = null;
              }
            }}
            onDurationChange={e => { const d = e.currentTarget.duration; setAudioDur(d); audioDurRef.current = d; }}
            onEnded={() => {
              setPlaying(false);
              if (chId) commitProgress(chId, audioDurRef.current, audioDurRef.current);
              const takeawayIdx = SCREENS.findIndex(s => s.kind === "takeaway" && s.id === chId);
              if (takeawayIdx >= 0 && takeawayIdx !== si) setSi(takeawayIdx);
            }}
            onError={() => { if (!audioUrl) setAudioErr(true); }}
          />

          <div className="au-mini">
            <div className="au-mini__thread">
              <div className="au-mini__thread-fill" style={{ width: `${audioDur ? (audioTime / audioDur) * 100 : 0}%` }} />
            </div>
            <button className="au-mini__play" onClick={togglePlay} disabled={!audioReady} aria-label={playing ? "Pause" : "Play"}>
              {playing
                ? <svg viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" /></svg>
                : <svg viewBox="0 0 16 16"><path d="M3 2L13 8 3 14V2Z" /></svg>}
            </button>
            <div
              className="au-mini__meta"
              role="button"
              tabIndex={0}
              onClick={() => setMode("listen")}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMode("listen"); } }}
            >
              <span className="au-mini__title">{chapter?.title ?? BOOK_TITLE}</span>
              <span className="au-mini__sub">
                <span>{audioUrl ? "AI NARRATION" : AUDIO[chId].label}</span>
                <span className="au-mini__dot">·</span>
                <span className="au-mini__time">
                  {audioReady
                    ? `${fmtTime(audioTime)} / ${fmtTime(audioDur)}`
                    : synth === "loading" ? "Generating narration…"
                    : synth === "error"   ? "Narration unavailable"
                    : "Loading narration…"}
                </span>
              </span>
            </div>
            <div className="au-mini__actions">
              <button className="au-iconbtn" onClick={() => setComposer({ kind: "note", chId, t: audioTime, text: "" })} aria-label="Add note">
                <svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><line x1="5" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><line x1="5" y1="10.5" x2="8.5" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
              </button>
              <button className="au-iconbtn" onClick={addBookmark} aria-label="Bookmark this moment">
                <svg viewBox="0 0 16 16" fill="none"><path d="M4 2.5h8v11l-4-2.6-4 2.6v-11Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
              </button>
              <button className="au-iconbtn au-iconbtn--expand" onClick={() => setMode("listen")} aria-label="Open player">
                <svg viewBox="0 0 18 18" fill="none"><path d="M5 11l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Bottom navigation ── */}
      <div className="bl-nav">
        <button
          className="bl-nav__btn"
          onClick={goPrev}
          disabled={si === 0}
          aria-label="Previous"
        >←</button>

        <div className="bl-nav__info">
          {chapter?.num && (
            <span className="bl-nav__chapter">{chapter.num} · {chapter.title}</span>
          )}
          <span className="bl-nav__pos">{si + 1} / {TOTAL}</span>
        </div>

        <button
          className="bl-nav__btn"
          onClick={goNext}
          disabled={si === TOTAL - 1}
          aria-label="Next"
        >→</button>
      </div>

      {/* ── Listen sheet (expanded now-playing) ── */}
      {mode === "listen" && chId && (
        <div className="au-sheet" role="dialog" aria-label="Audio player">
          <div className="au-sheet__bar">
            <button className="au-iconbtn au-iconbtn--expand" onClick={() => setMode("read")} aria-label="Back to reading">
              <svg viewBox="0 0 18 18" fill="none"><path d="M5 7l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="au-sheet__tabs" role="tablist">
              <button className={`au-tab${listenTab === "listen" ? " is-active" : ""}`} onClick={() => setListenTab("listen")} role="tab" aria-selected={listenTab === "listen"}>Listen</button>
              <button className={`au-tab${listenTab === "podcast" ? " is-active" : ""}`} onClick={() => setListenTab("podcast")} role="tab" aria-selected={listenTab === "podcast"}>Podcast</button>
            </div>
            <div className="au-sheet__actions">
              <button className="au-iconbtn" onClick={() => setMenu(true)} aria-label="Open table of contents">
                <svg viewBox="0 0 16 16" fill="none">
                  <line x1="5.5" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="5.5" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="5.5" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="2.5" cy="4" r=".8" fill="currentColor" />
                  <circle cx="2.5" cy="8" r=".8" fill="currentColor" />
                  <circle cx="2.5" cy="12" r=".8" fill="currentColor" />
                </svg>
              </button>
              <button className="au-iconbtn" onClick={() => { setLibTab("notes"); setLibOpen(true); }} aria-label="Open library">
                <svg viewBox="0 0 16 16" fill="none"><path d="M3 2.5h3v11l-1.5-1-1.5 1v-11Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /><path d="M7.5 2.5H13v11H7.5" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /><line x1="9" y1="6" x2="11.5" y2="6" stroke="currentColor" strokeWidth="1" /><line x1="9" y1="8.5" x2="11.5" y2="8.5" stroke="currentColor" strokeWidth="1" /></svg>
              </button>
            </div>
          </div>

          <div className="au-sheet__body">
            {listenTab === "listen" ? (
              <>
                <div className="au-now">
                  <div
                    className="au-now__art"
                    style={{ backgroundImage: "url(/images/books/the-bottom-line/trust-built-v2.png)" }}
                    aria-hidden="true"
                  >
                    <span className="au-now__art-mark">{chapter?.num ?? "·"}</span>
                  </div>
                  <p className="au-now__part">{chapter?.part ?? BOOK_TITLE}</p>
                  <h2 className="au-now__title">{chapter?.title}</h2>
                  {chapter?.subtitle && <p className="au-now__sub">{chapter.subtitle}</p>}
                  {audioUrl && <p className="au-now__unavailable">AI-generated narration</p>}
                  <div className="au-now__dl">
                    {audioReady && !audioUrl && (
                      <DownloadPill state={downloads[chId] ?? "idle"} onClick={() => startDownload(chId, AUDIO[chId].src)} />
                    )}
                    {audioReady && audioUrl && (
                      <span className="au-now__unavailable">Generated for this session</span>
                    )}
                    {!audioReady && synth === "loading" && (
                      <span className="au-dl"><span className="au-dl__ring" />Generating narration</span>
                    )}
                    {!audioReady && synth === "error" && (
                      <button className="au-dl" onClick={() => chId && synthesizeNarration(chId)}>Retry narration</button>
                    )}
                    {!audioReady && synth === "idle" && (
                      <span className="au-now__unavailable">Narration coming soon</span>
                    )}
                  </div>
                </div>

                <div className="au-transport">
                  <div className="au-scrub__bar" onClick={handleSeek}>
                    <div className="au-scrub__fill" style={{ width: `${audioDur ? (audioTime / audioDur) * 100 : 0}%` }} />
                    <div className="au-scrub__thumb" style={{ left: `${audioDur ? (audioTime / audioDur) * 100 : 0}%` }} />
                    <div className="au-scrub__marks">
                      {audioDur > 0 && bookmarks.filter(b => b.chId === chId).map(b => (
                        <span key={b.id} className="au-scrub__mark" style={{ left: `${(b.t / audioDur) * 100}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="au-scrub__time">
                    <span>{fmtTime(audioTime)}</span>
                    <span>-{fmtTime(Math.max(0, audioDur - audioTime))}</span>
                  </div>

                  <div className="au-controls">
                    <button className="au-ctrl au-ctrl--chev" disabled={chapterIdx <= 0} aria-label="Previous chapter"
                      onClick={() => { const p = chapterList[chapterIdx - 1]; const idx = SCREENS.findIndex(s => s.kind === "intro" && s.id === p?.id); if (idx >= 0) setSi(idx); }}>
                      <svg viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <button className="au-ctrl" onClick={() => skip(-15)} disabled={!audioReady} aria-label="Back 15 seconds">
                      <svg viewBox="0 0 24 24" fill="none"><path d="M12 5a7 7 0 1 0 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M12 5 8.5 8 12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className="au-ctrl__skip-label">15</span>
                    </button>
                    <button className="au-ctrl au-ctrl--play" onClick={togglePlay} disabled={!audioReady} aria-label={playing ? "Pause" : "Play"}>
                      {playing
                        ? <svg viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" /></svg>
                        : <svg viewBox="0 0 16 16"><path d="M3 2L13 8 3 14V2Z" /></svg>}
                    </button>
                    <button className="au-ctrl" onClick={() => skip(15)} disabled={!audioReady} aria-label="Forward 15 seconds">
                      <svg viewBox="0 0 24 24" fill="none"><path d="M12 5a7 7 0 1 1-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M12 5l3.5 3L12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className="au-ctrl__skip-label">15</span>
                    </button>
                    <button className="au-ctrl au-ctrl--chev" disabled={!nextChapter} aria-label="Next chapter"
                      onClick={() => { if (nextChapter) { const idx = SCREENS.findIndex(s => s.kind === "intro" && s.id === nextChapter.id); if (idx >= 0) setSi(idx); } }}>
                      <svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>

                  <div className="au-subrow">
                    <button className="au-speed" onClick={cycleRate} aria-label="Playback speed">{rate}&times;</button>
                    <div className="au-subrow__group">
                      <button className="au-iconbtn" onClick={addBookmark} aria-label="Bookmark">
                        <svg viewBox="0 0 16 16" fill="none"><path d="M4 2.5h8v11l-4-2.6-4 2.6v-11Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                      </button>
                      <button className="au-iconbtn" onClick={() => setComposer({ kind: "note", chId, t: audioTime, text: "" })} aria-label="Add note">
                        <svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><line x1="5" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><line x1="5" y1="10.5" x2="8.5" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
                      </button>
                      <button className="au-iconbtn" onClick={() => setComposer({ kind: "highlight", chId, t: audioTime, text: chapter?.pull ?? "" })} aria-label="Add highlight">
                        <svg viewBox="0 0 16 16" fill="none"><path d="M3 4h7M3 7h10M3 10h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                      </button>
                      <button className="au-iconbtn" onClick={() => setShareTarget({ text: chapter?.pull ?? chapter?.title ?? BOOK_TITLE, chapterTitle: chapter?.title ?? null })} aria-label="Share">
                        <svg viewBox="0 0 16 16" fill="none"><path d="M8 10V2M8 2 5.5 4.5M8 2l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.5 8v5h9V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="au-queue">
                  <p className="au-queue__label">Next in queue</p>
                  {nextChapter ? (
                    <button className="au-queue__item" onClick={() => { const idx = SCREENS.findIndex(s => s.kind === "intro" && s.id === nextChapter.id); if (idx >= 0) setSi(idx); }}>
                      <span className="au-queue__num">{nextChapter.num}</span>
                      <span className="au-queue__title">{nextChapter.title}</span>
                      <span className="au-queue__meta">Chapter</span>
                    </button>
                  ) : (
                    <button className="au-queue__item" onClick={() => setListenTab("podcast")}>
                      <span className="au-queue__num">&#9834;</span>
                      <span className="au-queue__title">{PODCAST[0].title}</span>
                      <span className="au-queue__meta">Podcast</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="au-pod">
                <p className="au-pod__intro">Conversations, author insight and related listening around {BOOK_TITLE}.</p>
                {PODCAST.map(ep => {
                  const isPlaying = podPlaying === ep.id;
                  const isLoading = podState[ep.id] === "loading";
                  const isError   = podState[ep.id] === "error";
                  return (
                  <div className="au-pod__item" key={ep.id}>
                    <div className="au-pod__art">
                      <img src={ep.image} alt="" />
                      <button
                        className={`au-pod__play${isPlaying ? " is-playing" : ""}`}
                        onClick={() => togglePodcast(ep)}
                        disabled={isLoading}
                        aria-label={isPlaying ? `Pause ${ep.title} preview` : `Play ${ep.title} preview`}
                      >
                        {isLoading
                          ? <span className="au-dl__ring" />
                          : isPlaying
                            ? <svg viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" /></svg>
                            : <svg viewBox="0 0 16 16"><path d="M3 2L13 8 3 14V2Z" /></svg>}
                      </button>
                    </div>
                    <div className="au-pod__body">
                      <p className="au-pod__kind">{ep.kind}</p>
                      <h3 className="au-pod__title">{ep.title}</h3>
                      <p className="au-pod__blurb">{ep.blurb}</p>
                      <div className="au-pod__foot">
                        {ep.guest && <span className="au-pod__guest">{ep.guest}</span>}
                        <span>{ep.duration}</span>
                        <span className="au-pod__status">
                          {isError ? "Preview unavailable" : isPlaying ? "Playing preview" : isLoading ? "Generating…" : "Preview"}
                        </span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Library ── */}
      {libOpen && (
        <div className="au-scrim" onClick={() => setLibOpen(false)}>
          <div className="au-panel" onClick={e => e.stopPropagation()}>
            <div className="au-panel__head">
              <span className="au-panel__title">Library</span>
              <button className="au-iconbtn" onClick={() => setLibOpen(false)} aria-label="Close library">
                <svg viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="au-libtabs">
              <button className={`au-libtab${libTab === "notes" ? " is-active" : ""}`} onClick={() => setLibTab("notes")}>Notes<span className="au-libtab__count">{notes.length}</span></button>
              <button className={`au-libtab${libTab === "highlights" ? " is-active" : ""}`} onClick={() => setLibTab("highlights")}>Highlights<span className="au-libtab__count">{highlights.length}</span></button>
              <button className={`au-libtab${libTab === "bookmarks" ? " is-active" : ""}`} onClick={() => setLibTab("bookmarks")}>Bookmarks<span className="au-libtab__count">{bookmarks.length}</span></button>
            </div>
            <div className="au-panel__body">
              <div className="au-prog">
                <p className="au-prog__label">Listening progress · synced to this device</p>
                <div className="au-prog__row">
                  <span className="au-prog__pct">{Math.round((playedChapters / chapterList.length) * 100)}%</span>
                  <span className="au-prog__meta">{playedChapters} / {chapterList.length} chapters</span>
                </div>
                <div className="au-prog__track"><div className="au-prog__fill" style={{ width: `${(playedChapters / chapterList.length) * 100}%` }} /></div>
              </div>

              {libTab === "notes" && (notes.length ? notes.map(n => {
                const c = CHAPTERS.find(x => x.id === n.chId);
                return (
                  <div className="au-item" key={n.id}>
                    <div className="au-item__top">
                      <button className="au-item__stamp" onClick={() => jumpToStamp(n.chId, n.t)}><svg viewBox="0 0 16 16"><path d="M3 2L13 8 3 14V2Z" /></svg>{fmtTime(n.t)}</button>
                      <span className="au-item__chapter">{c?.num ? `${c.num} · ${c.title}` : c?.title}</span>
                    </div>
                    <p className="au-item__text">{n.text}</p>
                    <div className="au-item__row">
                      <button className="au-item__action" onClick={() => setShareTarget({ text: n.text, chapterTitle: c?.title ?? null })}>Share</button>
                      <button className="au-item__action" onClick={() => deleteNote(n.id)}>Delete</button>
                    </div>
                  </div>
                );
              }) : <Empty label="No notes yet. Tap the note icon while listening to capture a thought at the exact moment." />)}

              {libTab === "highlights" && (highlights.length ? highlights.map(h => {
                const c = CHAPTERS.find(x => x.id === h.chId);
                return (
                  <div className="au-item au-item--highlight" key={h.id}>
                    <div className="au-item__top">
                      <button className="au-item__stamp" onClick={() => jumpToStamp(h.chId, h.t)}><svg viewBox="0 0 16 16"><path d="M3 2L13 8 3 14V2Z" /></svg>{fmtTime(h.t)}</button>
                      <span className="au-item__chapter">{c?.title}</span>
                    </div>
                    <p className="au-item__text">{h.text}</p>
                    <div className="au-item__row">
                      <button className="au-item__action" onClick={() => setShareTarget({ text: h.text, chapterTitle: c?.title ?? null })}>Share</button>
                      <button className="au-item__action" onClick={() => deleteHighlight(h.id)}>Delete</button>
                    </div>
                  </div>
                );
              }) : <Empty label="No highlights yet. Save a line that matters and it lives here." />)}

              {libTab === "bookmarks" && (bookmarks.length ? bookmarks.map(b => {
                const c = CHAPTERS.find(x => x.id === b.chId);
                return (
                  <div className="au-item" key={b.id}>
                    <div className="au-item__top">
                      <button className="au-item__stamp" onClick={() => jumpToStamp(b.chId, b.t)}><svg viewBox="0 0 16 16"><path d="M3 2L13 8 3 14V2Z" /></svg>{fmtTime(b.t)}</button>
                      <span className="au-item__chapter">{c?.num ? `${c.num} · ${c.title}` : c?.title}</span>
                    </div>
                    <div className="au-item__row">
                      <button className="au-item__action" onClick={() => deleteBookmark(b.id)}>Remove</button>
                    </div>
                  </div>
                );
              }) : <Empty label="No bookmarks yet. Mark a moment to return to it instantly." />)}
            </div>
          </div>
        </div>
      )}

      {/* ── Note / highlight composer ── */}
      {composer && (
        <div className="au-note-window-layer">
          <div
            className="au-compose"
            role="dialog"
            aria-modal="false"
            aria-label={composer.kind === "note" ? "Add a note" : "Add a highlight"}
          >
            <div className="au-compose__head">
              <span className="au-compose__stamp">{composer.kind === "note" ? "Note at" : "Highlight at"} <b>{fmtTime(composer.t)}</b></span>
              <button className="au-iconbtn" onClick={() => setComposer(null)} aria-label="Close">
                <svg viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
              </button>
            </div>
            <textarea
              className="au-compose__area"
              autoFocus
              placeholder={composer.kind === "note" ? "Capture a thought…" : "The line worth keeping…"}
              value={composer.text}
              onChange={e => setComposer({ ...composer, text: e.target.value })}
            />
            <div className="au-compose__foot">
              <button className="au-btn au-btn--primary" disabled={!composer.text.trim()}
                onClick={() => {
                  if (composer.kind === "note") addNote(composer.text, composer.t);
                  else addHighlight(composer.text, composer.t);
                  setComposer(null);
                }}>
                Save {composer.kind === "note" ? "note" : "highlight"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share card ── */}
      {shareTarget && (() => {
        const svg = buildShareCardSVG({ quote: shareTarget.text, chapterTitle: shareTarget.chapterTitle, dark });
        return (
          <div className="au-scrim au-scrim--center" onClick={() => setShareTarget(null)}>
            <div className="au-share" onClick={e => e.stopPropagation()}>
              <div className="au-share__head">
                <span className="au-compose__stamp">Share card</span>
                <button className="au-iconbtn" onClick={() => setShareTarget(null)} aria-label="Close">
                  <svg viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="au-share__preview" dangerouslySetInnerHTML={{ __html: svg }} />
              <div className="au-share__foot">
                <button className="au-btn" onClick={async () => { try { await navigator.clipboard.writeText(`"${shareTarget.text}"\n— ${BOOK_TITLE}, ${BOOK_AUTHOR}`); } catch { /* ignore */ } }}>Copy quote</button>
                <button className="au-btn au-btn--primary" onClick={() => downloadShareCard(svg)}>Download card</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
