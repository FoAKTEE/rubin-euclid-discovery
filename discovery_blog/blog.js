/* ==========================================================================
   Multi-Telescope Solar System Auto-Discovery Research Blog (Website 2)
   Interactive Astrometric Widgets, SVG Synthesis Hypergraph, i18n & Ledger
   ========================================================================== */

// Local development serves the blog on port 8766 and the 3D explorer on port 8765. Anywhere else
// (a static host, a sub-path deployment) the explorer is the sibling folder ../eyes_3d/.
const IS_LOCAL_BLOG_PORT =
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0") &&
  window.location.port === "8766";

const EYES_3D_BASE_URL = IS_LOCAL_BLOG_PORT
  ? `${window.location.protocol}//${window.location.hostname}:8765`
  : "../eyes_3d/index.html";

/* ==========================================================================
   1. Overleaf-Aligned English Dictionary ("en")
   ========================================================================== */
const I18N = {
  en: {
    doc_title: "Vibe Discovery",
    nav_hub: "Portal Hub",
    nav_gallery: "Movie Gallery",
    nav_cta_3d: "Launch 3D Explorer ↗",
    theme_dark: "Dark",
    theme_light: "Light",

    hero_title: "Vibe Discovery",
    hero_authors: "Hai-Yang Wang, Chang Sun",
    hero_affil: "California Institute of Technology",

    abstract_heading: "Summary",
    abstract_body:
      "What happens when you apply \"vibe coding\" principles to observational astronomy? We built an agentic \"vibe discovery\" platform that turns more than a dozen ground- and space-based public archives into a unified, modular workspace. Our agents decompose existing astronomical software into reusable components, bridged blind spots across separate sky surveys, and dispatched an independent fleet of verification agents to audit every candidate against archival pixels and orbit fits. We uncovered 93 solar system candidates—46 trans-Neptunian objects (TNOs), a Centaur, 3 irregular Jovian satellite candidates, and 43 asteroids—plus 25 faint high-proper-motion stars. The searches were built and run with Gemini 4 Carbon.",

    hero_cta_primary: "Launch 3D Solar System & Galaxy Explorer ↗",
    hero_cta_discoveries: "{{survivors}} Candidate Orbits in 3D ↗",
    hero_cta_gallery: "{{movie_targets}}-Target Detection Figure Gallery ↗",
    hero_cta_playground: "Interactive 3D Studio ↗",

    toc_title: "Contents",
    toc_grp_main: "Article",
    toc_grp_comp: "Interactive & Data",
    toc_intro: "Introduction",
    toc_bs: "1. Predictable Single-Survey Blind Spots",
    toc_dist: "2. Cadence & Catalog-Split Blind Spots",
    toc_tri: "3. Spatial Exclusion & Triangulation",
    toc_moons: "4. Reference-Frame Joins & Physical Tests",
    toc_agents: "5. Dynamic LEGO & Galactic Extension",
    toc_out: "6. Outlook",
    toc_ack: "Acknowledgements",
    toc_int: "Interactive Sky & L2 Demos",
    toc_ext: "Extended Data Plates",
    toc_s6: "Companion Data",

    stat_lbl_new: "Solar System candidates",
    stat_lbl_tnos: "Trans-Neptunian objects",
    stat_lbl_gold: "Asteroid candidates",
    stat_lbl_moons: "Jovian moon candidates",
    stat_lbl_centaurs: "Centaur candidates",
    stat_lbl_galactic: "Faint high-PM stars",
    stat_lbl_pairs: "Euclid–Gaia pairs",
    stat_lbl_movies: "Real-pixel movie targets",
    stat_lbl_frames: "Real archival frames",
    stat_lbl_stars: "Gaia 3D stars (explorer)",

    click_zoom: "Click to enlarge",
    lightbox_close: "Close [Esc] ✕",

    intro_kicker: "Introduction",
    intro_title: "Introduction",
    intro_p1:
      "Modern sky surveys release deep images and catalogs, yet each archive is processed in isolation by a pipeline built around one camera, one cadence, and one science goal. Every design choice in such a pipeline leaves a predictable blind spot. A distant outer-Solar-System body moves too little within a single night to form the tracklets that the linker of Vera C. Rubin Observatory expects. A bright Kuiper-belt object seen against the Galactic bulge falls inside sky that earlier surveys masked. A slow body observed for a few weeks from one ground site has a degenerate distance, and a moon of Jupiter curves around the planet and fails any heliocentric linker. Recovering such objects takes a join of telescopes or methods, a task that has demanded purpose-built pipelines from specialists in each archive.",
    intro_p2:
      "Machine learning and large language models have entered observational astronomy and automated science along two paths. In astronomy, neural classifiers and anomaly detectors have found exoplanets, asteroid trails in Hubble archives, bright transients, and morphological anomalies across nearly one hundred million Hubble cutouts, and have written textual explanations of transient images. Each of those systems works inside one survey's data format and inherits whatever that survey's pipeline kept or discarded. Outside astronomy, autonomous AI systems have discovered crystal structures, planned robotic chemistry experiments, evolved mathematical programs, and proposed research hypotheses. Those systems rely on closed-world evaluators, physical simulators, or controlled laboratory apparatus. Astronomical archives are open, noisy, and heterogeneous: telescopes observe from the ground, from low Earth orbit, and from the Sun–Earth second Lagrange point (<i>L</i><sub>2</sub>), with mismatched catalogs, rotated detectors, and undocumented processing artifacts.",
    intro_p3:
      "We test whether AI coding agents can bridge this gap by composing searches from modular parts, an approach we call <strong>vibe discovery</strong> (<a href=\"#fig-pipeline\">Fig. 1</a>). Human states the scientific targets, the blind-spot hypotheses, and the acceptance rules in plain language. Agents do the rest of the construction. They read the astronomical literature and open-source codes, decompose each code into tested physical kernels, and wrap every archive behind one standardized observation interface. For each blind spot they load the telescopes, instruments, and algorithmic bricks it requires and join them like LEGO blocks on a shared baseplate. A second set of agents then verifies every candidate independently from a read-only copy of the project.",
    intro_p4:
      "Running this architecture across more than a dozen public archives and verifying every candidate independently yields 93 Solar System candidates for follow-up: 46 trans-Neptunian objects (TNOs), a Centaur, 3 candidate irregular satellites of Jupiter, and 43 asteroids. On the same baseplate, the Galactic searches recover 25 faint high-proper-motion stars absent from Gaia and measure how often Euclid resolves companions of Gaia stars with excess astrometric noise. Every Solar System body reported here is a candidate that awaits a Minor Planet Center designation and independent recovery; provisional labels such as <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_003\">R25-D03 ↗</a> identify them (<a href=\"#sec-ledger\">Companion Data</a>).",
    fig1_cap:
      "<strong>Figure 1 · Several vantage points and searches assembled from modular blocks.</strong> <strong>a,</strong> Schematic of the ground, low-Earth-orbit, and Sun–Earth <i>L</i><sub>2</sub> observatories used here; the dark-sky backdrop is illustrative artwork. The five stamps beneath it are archival pixels at the positions of five candidates, labeled with instrument, date, and exposure type. <strong>b,</strong> Coding agents decompose archives and open codes into blocks that attach to one observation record; an independent verification pass checks the candidates, with the verified discovery yields at right.",

    bs_kicker: "Section 1 · Design Principles",
    bs_title: "Predictable single-survey blind spots",
    bs_p1:
      "Three ideas – A single-survey pipeline loses objects wherever its operating assumptions bind, so the losses follow from the pipeline's design. Adding a second telescope, an archival epoch, or a method from another code addresses each loss. Decomposing codes and archives into interchangeable blocks lets coding agents build such joins, and an independent check verifies which candidates stand.",
    bs_p2:
      "Early Rubin data show the first idea at work. Standard linking needs intra-night tracklets, pairs of detections separated by measurable motion within one night. Beyond Neptune a body moves too little across a short revisit, and a night with a single visit yields no tracklet at any brightness. Rubin also separates detections into difference-image (<code>DiaSource</code>) and direct-image (<code>Source</code>) catalogs. Where templates are absent or incomplete, a distant body appears only in the direct-image catalog, so a search of either table alone breaks multi-month arcs. Our search of Rubin data yields 10 TNO candidates with fitted orbits and recovers 14 cataloged distant TNOs without their positions as input. None of these appeared in the data preview's table of linked objects when the search queried it. Most of the recovered controls carry 2025 designations based on Rubin astrometry from other dedicated searches: the data reach such bodies, and the standard linking table omits them.",
    bs_p3:
      "Three further blind spots follow the same logic. Earlier wide-field TNO searches masked low Galactic latitudes to avoid crowding. Short arcs from one site leave distance and radial velocity degenerate, and a single Euclid sequence spans too little motion to separate a distant body from static sources. Fixed reference frames hide two more classes: second moments stored in detector coordinates mix trailing with shape as the camera rotates, and heliocentric linkers reject satellites that curve inside Jupiter's Hill sphere. Each loss points to a specific join.",

    dist_kicker: "Section 2 · Cadence & Catalog-Split Join",
    dist_title: "Closing cadence and catalog-split blind spots",
    dist_p1:
      "Linking detections across nights without tracklets, on the union of Rubin's difference-image and direct-image tables, yields 10 Rubin TNO candidates and 18 further candidates retained through a group-level check. <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_003\">R25-D03 ↗</a> shows what this blind spot hides (<a href=\"#fig-orbits\">Fig. 2</a>; see also <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_004\">R25-D04 ↗</a>, <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_014\">R25-D14 ↗</a>, and the <a href=\"#blink-widget\">interactive blink comparator</a>). Rubin detected it on 8 nights across 124.8 d, and the fit places it on an eccentric orbit with perihelion beyond Neptune and a semimajor axis of 156.6 ± 10.0 au. Two direct-image detections in November carry that solution, and a second opposition will pin down the large semimajor axis.",
    dist_p2:
      "The Tisserand parameter of R25-D03 with respect to Neptune is 3.09, slightly above three (<a href=\"#fig-orbits\">Fig. 2b</a>). At this semimajor axis and inclination, that value corresponds to a perihelion a few astronomical units outside Neptune's orbit. About half of the cataloged bodies with semimajor axes beyond 150 au share the property, and several have lower inclinations. R25-D03 therefore joins the known population of detached distant bodies whose perihelia sit beyond Neptune's reach.",
    dist_p3:
      "The same tracklet-free linking runs on the Isolated Tracklet File of the Minor Planet Center, where unlinked tracklets from many surveys accumulate. It joins archived tracklets from other observers into 5 outer-Solar-System candidates across single-season arcs.",
    fig2_cap:
      "<strong>Figure 2 · Fitted orbits of the candidates and a shape test for binaries.</strong> <strong>a,</strong> Perihelion against semimajor axis by search, with Neptune's perihelion line and resonances; open squares are Euclid candidates at nominal values. <strong>b,</strong> Inclination against perihelion for published bodies beyond 150 au (gray) and R25-D03 (star); the curve marks a Tisserand parameter of three. <strong>c,</strong> Sky-frame quadrupole moments of 2025 NW189, per visit and stacked, with cataloged wide binaries against single-object controls.",

    tri_kicker: "Section 3 · Galactic Bulge & Space–Ground Parallax",
    tri_title: "Spatial exclusion and space–ground triangulation",
    tri_p1:
      "Joining telescopes across time and across space addresses two more blind spots: sky excluded near the Galactic plane, and the distance degeneracy of short arcs from one site.",
    tri_p2:
      "In the crowded bulge fields where earlier searches stopped, agents combined Rubin detections with archival Dark Energy Camera (DECam) exposures from earlier years and searched along each predicted orbit (<a href=\"#fig-decam\">Fig. 3</a>, top row). The Rubin detections of <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"EPS_002\">R25-E02 ↗</a> lie at low Galactic latitude, directly against the bulge (alongside <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"EPS_007\">R25-E07 ↗</a> south of the bulge), and its brightness makes it one of the larger bodies in the sample if its surface is dark. Archival DECam exposures from 2024 cover the predicted position at aperture signal-to-noise ratios of 2.1 and 2.8 among crowded stars. <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_009\">R25-D09 ↗</a> is the firm two-opposition link: DECam recorded it in 2022 at a signal-to-noise ratio of 23.0 on one night, with empty sky at the same position the night before, and the 1173.0 d arc fixes its semimajor axis close to Neptune's 2:1 resonance.",
    tri_p3:
      "Where no archival image exists, a spacecraft and a ground telescope observing at the same time replace months of orbital motion with parallax. Euclid orbits the Sun–Earth <i>L</i><sub>2</sub> point, about 1.5 × 10<sup>6</sup> km from Cerro Tololo in Chile. A distant body imaged from both sites within one night shifts on the sky between the two viewpoints by an angle that gives its distance (<a href=\"#parallax-widget\">interactive triangulation slider</a>). Two Euclid candidates, <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUC0005\">EUC-S05 ↗</a> and <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUC0002\">EUC-S02 ↗</a>, have simultaneous DECam counterparts whose two-site geometry places both bodies beyond Neptune. Euclid alone supplies the other distant candidates (<a href=\"#sec-ledger\">Companion Data</a>, including <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUCLID_VIS_TNO_02\">EUC-V02 ↗</a>). Linking sequences taken days apart measures the parallax from the spacecraft's own motion around the Sun and places these slow movers at trans-Neptunian distances, with 3 confirmed on pixels across multiple sequences (<a href=\"#fig-decam\">Fig. 3</a>, lower rows).",
    fig3_cap:
      "<strong>Figure 3 · Archival pixels at the positions of the distant candidates.</strong> Top row, Dark Energy Camera exposures at the positions of R25-E02, R25-D09, EUC-S05, EUC-S02, and EUC-CW04. Lower rows, Euclid visible-light single exposures of the {{euclid_tnos}} trans-Neptunian candidates. Each stamp sits above a comparison of the same sky at other epochs. Solid cross-hairs mark the expected position at the epoch shown and dashed cross-hairs the same position at other epochs; labels give date, band, and aperture signal-to-noise ratio. North is up and east is left.",

    moons_kicker: "Section 4 · Frame Rotations, Small Bodies & Spectra",
    moons_title: "Reference-frame joins, small bodies and physical tests",
    moons_p1:
      "Joins between coordinate frames work like joins between telescopes. Rotating Rubin's detector-frame second moments into sky coordinates separates trailing along the motion from elongation that stays fixed on the sky while the camera rotates. Applied to well-observed Kuiper-belt objects, the sky-frame quadrupole cleanly recovers the cataloged wide binaries in the sample. Among objects without a known companion, 2025 NW189 shows a sky-frame quadrupole excess above every single-object control (<a href=\"#fig-orbits\">Fig. 2c</a>), making it a strong target for resolved imaging follow-up.",
    moons_p2:
      "Subtracting Jupiter's motion and linking archived tracklets in a planet-centered frame yields 3 candidate irregular satellites on bound retrograde orbits (<a href=\"#ext-fig-moons\">Extended Data</a>), each ready for second-opposition recovery. In the inner Solar System, linking Euclid visible and near-infrared detections within single days yields 43 asteroid candidates, 2 of them at the distance of Jupiter's Trojans (<a href=\"#ext-fig-euclid\">Extended Data</a>). Rubin adds the Centaur <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"CENTAUR_343_IOTA004\">R25-I04 ↗</a>, whose 74.0 d arc fixes an orbit between Saturn and Uranus that matches no cataloged body.",
    moons_p3:
      "Once an orbit is known, spectral archives along its path become physical tests. SPHEREx spectra extracted along the ephemerides of interstellar comet <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"ATLAS_3I\">3I/ATLAS ↗</a> and the active Centaur <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"SW1_29P\">29P/Schwassmann–Wachmann 1 ↗</a> recover the carbon monoxide and carbon dioxide emission of these comets, validating the moving-target extraction (<a href=\"#ext-fig-spectra\">Extended Data</a>). For the fitted orbits of <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_003\">R25-D03 ↗</a> and <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"EPS_002\">R25-E02 ↗</a>, a volatile-escape model predicts surfaces that have lost methane, nitrogen, and carbon monoxide while retaining ethane and carbon dioxide (<a href=\"#ext-fig-volatiles\">Extended Data</a>). The same multi-wavelength joins also test published far-infrared candidates for a distant planet, identifying a cataloged edge-on star-forming galaxy beside one IRAS source whose far-infrared-to-radio ratio matches a stationary counterpart.",

    agents_kicker: "Section 5 · Modular Architecture, Verification & Milky Way",
    agents_title: "Dynamic LEGO assembly, independent verification and Galactic extension",
    agents_p1:
      "Building this many cross-survey paths by hand would occupy several survey teams. Coding agents running on Gemini 4 Carbon lowered that cost by separating every search into two reusable layers: archive adapters and algorithmic bricks. The agents surveyed open-source astronomical codes, among them heliocentric linkers (<code>HelioLinC3D</code>, <code>THOR</code>), short-arc orbit methods (Bernstein–Khushalani), shift-and-stack (<code>KBMOD</code>), N-body integrators (<code>REBOUND</code>, <code>ASSIST</code>), and Galactic binary and orbit packages (<code>gaiamock</code>, <code>galpy</code>). They reimplemented the core numerical operations once as array kernels whose accelerated and reference versions agree to double precision, and mapped each telescope onto one observation record: epoch, observer position in the Solar System, sky position with uncertainty, and brightness. Once an archive adapter exists, detections from Rubin in Chile, Euclid at <i>L</i><sub>2</sub>, DECam, and SPHEREx enter any brick.",
    agents_p2:
      "<a href=\"#fig-progress\">Figure 4</a> traces how the bricks accumulated over four phases of work. Phase I attached Euclid and Rubin adapters with satellite vetoes and tracklet-free linkers. Phase II widened the baseplate to more than a dozen archives and added archival DECam searches, spectral joins, and the linking of archived tracklets. Phase III added planet-centered linking, sky-frame moments, and internal cross-checks of the candidate lists. Phase IV reused the Euclid, Rubin, and Legacy Surveys adapters for the Galactic searches.",
    agents_p3:
      "Verification rested on separated roles. Builder agents wrote adapters and cross-survey joins. Tester agents validated each search through blind recoveries of cataloged objects without their positions as input: distant TNOs, irregular satellites of the giant planets, the neutron-star binary Gaia NS1, and a known hypervelocity star. After the searches closed, an independent set of Claude agents working from a read-only copy of the project repeated the archive queries, orbit fits, and pixel measurements, retaining 93 Solar System candidates alongside recovery controls <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge emerald js-3d-link\" data-fly-focus=\"EUCLID_EES149_GOLD_18\">2019 UM31 ↗</a> and <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge emerald js-3d-link\" data-fly-focus=\"QB98_2021\">2021 QB98 ↗</a>. Archival pixels back the retained list wherever archives serve them: we assembled 388 real archival image frames across 96 targets in the <a href=\"../movie_gallery/index.html\">96-Target Movie Gallery</a>, with Euclid single exposures showing a source at the predicted position of every retained Euclid candidate.",
    agents_p4:
      "To test the same principle outside the Solar System, agents attached Gaia DR3, Legacy Surveys DR10, Euclid DR1, and Rubin to the baseplate (<a href=\"#ext-fig-galactic\">Extended Data</a>). Linking decade-long optical baselines to Euclid positions discovered 25 stars with measured proper motions and no Gaia DR3 source nearby: 1 white-dwarf candidate, 17 ultracool-dwarf candidates, 2 redder objects with the colors of late-M to early-L dwarfs, and 5 late-M dwarfs. All of them appear in the NOIRLab Source Catalog with nonzero proper motions and have no SIMBAD identification, making them immediate spectroscopic targets. In Euclid Deep Field South, Euclid resolves a companion within one arcsecond of 129 of 1,200 Gaia stars with excess astrometric noise, against 3 of as many matched controls. The images reveal directly the binary companions implied by Gaia's excess noise, with the resolved fraction rising toward redder, nearer stars.",
    agents_p5:
      "<a href=\"#fig-hypergraph\">Figure 5</a> shows the finished architecture as an incidence hypergraph: rows are telescope archives and algorithmic bricks, and each column is one assembled search, physical test, or verification check. Most columns join two or more telescopes across ground and space or combine bricks drawn from different community codes. Euclid VIS, Rubin LSSTCam, and Gaia are the most connected bricks.",
    fig4_cap:
      "<strong>Figure 4 · LEGO assembly and capability timeline.</strong> <strong>a,</strong> Bricks accumulate on one observation baseplate across four work phases: earlier bricks stay in place, new bricks hover above their slots, and in Phase IV the orbit-linking brick (faded) gives way to a proper-motion brick for Galactic stars. <strong>b,</strong> Cumulative modular capabilities (solid curve, colored by domain) and blind recoveries or consistency checks (dashed curve, hollow markers) against active working time, reconstructed from repository timestamps with idle pauses removed.",
    fig5_cap:
      "<strong>Figure 5 · Hypergraph of telescopes and algorithmic bricks.</strong> Rows list archives ordered by wavelength, with markers for where each observes, followed by algorithmic bricks labeled by the community codes they come from. Each column is one assembled search, test, or check and joins every marked brick. Top bars count the verified candidates from each search path; side bars count the joins per brick.",

    out_kicker: "Section 6",
    out_title: "Outlook",
    out_p1:
      "Three working rules summarize vibe discovery. Single-survey pipelines lose objects wherever their cadence, sky-mask, coordinate-frame, or deblending assumptions bind, so the blind spots follow from the pipeline's design. Treating telescopes, instruments, and community codes as interchangeable bricks on one interface addresses each blind spot, in the Solar System and in the Galaxy. Coding agents cut the cost of assembling cross-survey joins far enough for one researcher to test dozens of archive combinations in days.",
    out_p2:
      "Pairing fast agentic construction with an independent verification pass makes the workflow self-contained and reliable: every retained candidate is backed by independent archive queries, refitted orbits, and archival pixels before community follow-up.",
    out_p3:
      "Every body reported here now invites standard community follow-up: astrometry submitted to the Minor Planet Center, recovery at a second opposition by independent telescopes, and spectra of the brightest bodies and of the cool dwarfs. With AI agents writing and composing modular survey software, a single researcher can explore cross-archive parameter spaces across the Solar System and Milky Way while keeping full scientific oversight of the physical evidence.",
    out_link_gallery: "{{movie_targets}}-Target Detection Figure Gallery",
    out_link_3d: "Open 3D Explorer",
    out_link_ledger: "Companion Data",

    ack_title: "Acknowledgements",
    ack_p1: "We gratefully acknowledge Google for supporting this work through the Google Antigravity scientific research program.",

    comp_divider_label: "Interactive Demonstrations & Extended Data",

    int_kicker: "Interactive Companion · Measured Astrometry",
    int_title: "Interactive Blink Comparator and Sun–Earth L2 Triangulation",
    int_p1:
      "The two interactive canvases below plot measured survey coordinates against illustrative reference starfields to demonstrate how tracklet-free blinking isolates faint movers (R25-D03, R25-E02, and the Euclid recovery control 2019 UM31) and how simultaneous CTIO DECam × Euclid L2 sightlines triangulate distance across 1.685 million kilometers. All real archival pixel stamps live in the Extended Data plates and the 96-target Movie Gallery.",

    w1_kicker: "Interactive Schematic · Measured Astrometry, Illustrative Star Field",
    w1_title: "Blink Comparator: Locate the Moving Body Across Measured Survey Epochs",
    w1_t_d003: "R25-D03 (51.15 au TNO candidate)",
    w1_t_eps002: "R25-E02 (Galactic-bulge TNO candidate)",
    w1_t_gold18: "2019 UM31 (Euclid recovery control)",
    w1_auto_on: "Auto-Blink: ON",
    w1_auto_off: "Auto-Blink: OFF",
    w1_reticle: "Target Reticle",
    w1_diff: "Difference Mode",
    w1_scrubber: "Epoch Scrubber:",
    w1_interval: "Cadence:",
    tel_target: "Target:",
    tel_epoch: "UTC:",
    tel_phot: "Photometry:",
    tel_regime: "Regime:",

    w2_kicker: "Interactive 1.685-Million-km Baseline Triangulator",
    w2_title: "Stereoscopic Parallax Slider: CTIO Chile (Earth) ↔ ESA Euclid (Sun–Earth L2)",
    w2_t_euc5: "EUC-S05 (64.19″ shift · 35.60 au)",
    w2_t_euc2: "EUC-S02 (66.47″ shift · 34.40 au)",
    w2_btn_earth: "CTIO Chile (0 km)",
    w2_btn_l2: "Euclid L2 (1.685M km)",
    w2_sweep_on: "Auto-Sweep: ON",
    w2_sweep_off: "Auto-Sweep: OFF",
    w2_slider_lbl: "Observer Position Along Space–Ground Baseline:",
    tel_baseline: "Baseline:",
    tel_shift: "Apparent Shift:",
    tel_range: "Triangulated Range:",
    tel_bound: "Kinetic Bound:",

    ext_kicker: "Extended Data · Multi-Survey Results",
    ext_title: "Extended Data Plates",
    ext_p1:
      "Click any Extended Data plate below to enlarge it. Vector detection figures for every discovery target and recovery control are served in full resolution in the companion Detection Figure Gallery.",
    realpix_note:
      "<strong>Real archival pixels.</strong> Single exposures, static references, and difference panels where the archive provides them are in the movie gallery: <a href=\"../movie_gallery/index.html?group=group1\">Group I (Rubin and DECam)</a>, <a href=\"../movie_gallery/index.html?group=group2\">Group II (Euclid trans-Neptunian candidates)</a>, <a href=\"../movie_gallery/index.html?group=group5\">Group V (Euclid asteroid candidates)</a>, <a href=\"../movie_gallery/index.html?group=galactic\">Galactic stars</a>, and the <a href=\"../movie_gallery/index.html?group=controls\">two recovery controls</a>.",
    ext_fig1_cap:
      "<strong>Extended Data · Spectra and spectral energy distributions from archive joins.</strong> <strong>a,</strong> SPHEREx spectra of comet 3I/ATLAS, Centaur 29P/Schwassmann–Wachmann 1, and asteroid (492) Gismonda, with Euclid photometry of 2015 BP519, scaled and offset; dashed lines mark water, carbon dioxide, and carbon monoxide bands. <strong>b,</strong> Thermal fluxes of (87) Sylvia with a thermal-model curve and a published ALMA point; diamonds are Euclid fluxes of (6493) Cathybennett. <strong>c,</strong> Archival fluxes at a published far-infrared planet candidate (circles) with schematic curves, a radio flux for a second candidate (square), and upper limits for R25-D03 (triangles).",
    ext_fig2_cap:
      "<strong>Extended Data · Which ices two distant candidates can keep.</strong> Volatile-retention diagram: curves mark the loss of methane, nitrogen, carbon monoxide, ethane, and carbon dioxide over the age of the Solar System for two vapor-pressure laws (solid and dotted). Hatched bands show R25-E02 (orange) and R25-D03 (blue) across plausible surface reflectivities, from the perihelion temperature (squares) to the orbit-averaged equivalent temperature (circles); gray symbols are known bodies.",
    ext_fig3_cap:
      "<strong>Extended Data · Jovian satellite candidates and wide stellar pairs.</strong> <strong>a,</strong> Semimajor axis in units of Jupiter's Hill radius against inclination for cataloged irregular satellites (gray) and the {{moons}} candidates retained by the independent check (orange, with fit uncertainties). <strong>b,</strong> Scaled relative velocity against projected separation for wide Gaia pairs: blue points have precise kinematics, open triangles are pairs above the bound limit (dashed) flagged as triples, and diamonds are unflagged pairs above it.",
    ext_fig4_cap:
      "<strong>Extended Data · High-proper-motion stars absent from Gaia and companions resolved by Euclid.</strong> <strong>a,</strong> Legacy Surveys, Euclid VIS, and Euclid NISP cutouts of six stars; solid and dashed circles mark the positions at the Euclid and Legacy Surveys epochs. <strong>b,</strong> Fraction of high-RUWE Gaia stars with a Euclid companion within one arcsecond, by RUWE bin, against the matched-control level (dashed), with binomial intervals. <strong>c,</strong> The same within two arcseconds for FGK and M dwarfs and their controls.",
    ext_fig5_cap:
      "<strong>Extended Data · Euclid exposures of the asteroid candidates.</strong> Visible-light single exposures of the ecliptic-field candidates EUC-G26 to EUC-G32, the COSMOS candidates EUC-J01, EUC-J02, and EUC-M01 to EUC-M03, and the deep-field candidates, each above a comparison of the same sky at other epochs. The last pair shows the trailed image of the cataloged asteroid 2019 UM31, the recovery control.",
    ext_fig6_cap:
      "<strong>Extended Data · Archival stamps and same-sky comparisons.</strong> Fourteen panels at the positions of the distant candidates and three asteroid-field targets, from Dark Energy Camera and Euclid VIS single exposures, labeled with date, band, and aperture signal-to-noise ratio. The final pair is the trailed image of the cataloged asteroid 2019 UM31, the recovery control. North is up and east is left.",

    audit_kicker: "Independent Verification Record",
    audit_title: "Full Verification Accounting & Provenance",
    audit_p1:
      "After the searches closed, a second set of agents working from a read-only copy of the project regraded every claim from its own archive queries, orbit fits, and archival pixels. Of <strong>{{claims}}</strong> Solar System claims made before the audit, <strong>{{survivors}}</strong> survive as candidates for follow-up ({{per_object}} graded object by object and {{per_claim}} through group-level existence checks; {{verified}} graded verified and {{plausible}} plausible). <strong>{{catalogued}}</strong> were matched to previously cataloged bodies, <strong>{{eliminated}}</strong> were eliminated, and <strong>{{disputed}}</strong> remain disputed and are not counted. Every surviving body is a candidate that awaits a Minor Planet Center designation and independent recovery.",
    audit_p2:
      "<strong>Verification notes.</strong> <code>EUC-G18</code> (catalog alias <code>EUCLID_EES149_GOLD_18</code>) is the cataloged main-belt asteroid <strong>2019 UM31</strong> (a = 2.60 au, e = 0.31, i = 7.05°, H = 19.3) and serves as the Euclid VIS recovery control beside the Rubin control <strong>2021 QB98</strong>. Asteroid candidates with arcs shorter than a day leave orbits and sizes open. In the SPHEREx spectra the check confirms CO and <sup>12</sup>CO<sub>2</sub> emission in 3I/ATLAS and CO emission in 29P.",
    audit_p3:
      "<strong>Real pixels.</strong> The <a href=\"../movie_gallery/index.html\">movie gallery</a> holds archival image sequences for <strong>{{movie_targets}}</strong> targets: {{movie_discovery_targets}} discovery targets and the {{movie_controls}} recovery controls, in <strong>{{movie_frames}}</strong> real archival frames of which {{movie_single}} are single exposures, with <strong>{{movie_synthetic}}</strong> synthetic frames and {{movie_gaps}} coverage gaps. For {{movie_no_epoch}} of them (eleven Group I targets and the 2021 QB98 control) the archive serves only static deep coadds.",
    audit_link_gallery: "{{movie_targets}}-Target Detection Figure Gallery",
    audit_link_verdicts: "Verification Ledgers (JSON)",

    s6_title: "Companion Data",
    s6_p1:
      "Filter, sort, and inspect the complete candidate catalog below (defaulting to the {{ledger_survivors}} verified discovery candidates) alongside sky coordinates, epochs, magnitudes, heliocentric distances, fitted orbital elements (<i>a</i>, <i>q</i>, <i>e</i>, <i>i</i>, ϖ, <i>T</i><sub>N</sub>), and 3D Explorer links. Additional rows for recovery controls, cataloged objects, and spectral targets can be toggled using the status filters.",

    la_all: "All rows",
    la_survivor: "Verified candidates",
    la_disputed: "Disputed / uncounted",
    la_known: "Known / control",
    la_volatile: "Spectral targets",
    lf_all: "All populations",
    lf_etno: "Rubin & tracklet-archive TNOs / Centaur",
    lf_stereo: "Euclid trans-Neptunian rows",
    lf_moon_bin: "Jovian moon candidates",
    lf_gold: "Inner Solar System rows",
    lf_vol: "SPHEREx spectral targets",
    ledger_search_ph: "Search ID, designation, status, or facility...",
    th_obj: "Designation · Status",
    th_fac: "Facility / Span",
    th_coord: "ICRS (α, δ)",
    th_mag: "Mag / H",
    th_r: "r (AU)",
    th_size: "Size / Bands · Note",
    th_3d: "3D Orbit",
    fly_row_btn: "3D ↗",
    st_survivor: "VERIFIED CANDIDATE",
    st_disputed: "DISPUTED / UNCOUNTED",
    st_control: "KNOWN / CONTROL",
    st_catalogued: "KNOWN / CATALOGUED",
    st_volatile: "VOLATILE",
    vd_verified: "Verified",
    vd_plausible: "Plausible · needs follow-up",
    vd_disputed: "Disputed or overclaimed",
    vd_invalid: "Claim invalid or unsupported",
    gl_object: "graded per object",
    gl_claim: "graded through a group claim",
    orbit_open_tip: "The independent check does not fix the tabulated orbit of this row",
    ledger_summary_fmt: "Showing {shown} of {total} rows · {{ledger_survivors}} verified candidates · {{ledger_volatile}} spectral targets · {{ledger_known}} known/controls · {{ledger_disputed}} uncounted",
    ledger_legend: "<strong>†</strong> Provisional or unconstrained orbit: for arcs shorter than a day, orbit elements and sizes are not determined; sizes elsewhere assume an albedo. Dropped claims ({{eliminated}}: {{eliminated_list}}) have no row.",

    footer_hub: "Portal Hub",
    footer_gallery: "{{movie_targets}}-Target Detection Figure Gallery",
    footer_left:
      "Data Credits: ESA Euclid DR1 (MPC 273, NASA/IPAC IRSA), Vera C. Rubin Observatory DP2 (MPC X05), Gaia DR3, CTIO DECam (MPC W84), Legacy Surveys DR10, NASA SPHEREx, WISE/NEOWISE, ASKAP, eROSITA, and MPC ITF.",
    footer_cta: "Open 3D Solar System Explorer ↗",

    /* Canvas Internal Overlay Strings */
    cv_loupe_title: "10× Pixel Stamp",
    cv_diff_on: "DIFFERENCE SUBTRACTED (Static Sky Removed)",
    cv_sky_view: "SKY-PLANE EPHEMERIS VIEW (Gaia DR3 Frame)",
    cv_helio_view: "HELIOCENTRIC TRIANGULATION GEOMETRY (Top-Down)",
    cv_epipolar: "Exact L2 → W84 Epipolar Line (Δ⊥ = 0.00″)",
    cv_sun: "Sun",
    cv_earth_w84: "Earth (CTIO W84)",
    cv_euclid_273: "Euclid @ L2 (273)",
    cv_observer: "Active Observer",
    cv_decam_note: "DECam 960 s r+i counterpart (candidate)",
    cv_if_matched: "two-site geometry"
  }
};

/* ==========================================================================
   2. Hypergraph Node Inspector Metadata
   ========================================================================== */
const HYPERGRAPH_DETAILS = {
  n_mgdb: {
    en: {
      title: "Literature Blind-Spot & Brick Decomposition",
      desc: "Coding agents read survey papers and open-source codes—HelioLinC3D, THOR, Bernstein–Khushalani, KBMOD, REBOUND, ASSIST, gaiamock, and galpy—to isolate shared physical kernels on a single observation interface.",
      fly: { category: "discoveries" }
    }
  },
  n_rubin: {
    en: {
      title: "Vera C. Rubin Observatory DP2 Adapter & Tracklet-Free Linker",
      desc: "Tracklet-free linking on the union of unlinked dp2.DiaSource and orphan dp2.Source detections, paired with REBOUND/ASSIST N-body fitting to extend single-season opposition arcs through eastern quadrature.",
      fly: { focus: "DELTA_003" }
    }
  },
  n_euclid: {
    en: {
      title: "ESA Euclid DR1 @ Sun–Earth L2 Adapter",
      desc: "Streams 0.10 arcsec/pixel VIS frames and NISP photometry under exact L2 SPICE observer geometry, pairing fast inner-system streaks across dithers and slow outer movers across epochs and with CTIO DECam.",
      fly: { focus: "EUCLID_EES149_GOLD_01" }
    }
  },
  n_veto: {
    en: {
      title: "Artificial-Satellite & Static-Sky Veto Engine",
      desc: "Propagates SGP4 spacecraft elements alongside SkyBoT and JPL Horizons ephemerides, checks off-epoch static-sky images across Gaia DR3, DECam, and Legacy Surveys, and filters stationary galaxies from moving-body searches.",
      fly: { category: "discoveries" }
    }
  },
  n_spherex: {
    en: {
      title: "NASA SPHEREx Spectrophotometry & Multi-Frequency Archive Joins",
      desc: "Extracts 0.75–5.00 µm linear-variable-filter coma spectra along known ephemerides and joins WISE/NEOWISE, IRAS/AKARI, ALMA, and ASKAP fluxes to test volatile retention and stationary far-infrared counterparts.",
      fly: { focus: "ATLAS_3I" }
    }
  },
  he_rubin: {
    en: {
      title: "Rubin Cadence, Catalog-Split & Galactic-Bulge Joins",
      desc: "Extends R25-D03 from opposition through November across 124.8 d (a = 156.6 ± 10.0 au), links 2022 DECam pixels to R25-D09 (1173.0 d arc), and isolates Galactic-bulge candidate R25-E02 alongside 2024 DECam frames.",
      fly: { focus: "DELTA_003" }
    }
  },
  he_stereo: {
    en: {
      title: "Simultaneous Sun–Earth L2 × Chile Space–Ground Triangulator",
      desc: "Pairs simultaneous Euclid L2 (MPC 273) and CTIO DECam (MPC W84) sightlines for EUC-S05 and EUC-S02. If the modest DECam counterparts are real, single-night parallax places both bodies beyond Neptune.",
      fly: { focus: "EUC0005" }
    }
  },
  he_euclid: {
    en: {
      title: "Multi-Epoch Euclid L2 Linker",
      desc: "Recovers {{asteroids}} short-arc asteroid candidates and {{euclid_tnos}} Euclid trans-Neptunian candidates, alongside the cataloged main-belt recovery control 2019 UM31 (EUC-G18).",
      fly: { focus: "EUCLID_EES149_GOLD_18" }
    }
  },
  he_spherex: {
    en: {
      title: "Transient-Preserving Coma Spectroscopy",
      desc: "Validates SPHEREx extraction on interstellar comet 3I/ATLAS and active Centaur 29P/Schwassmann–Wachmann 1, with confirmed CO and 12CO2 emission in 3I/ATLAS and CO emission in 29P.",
      fly: { focus: "SW1_29P" }
    }
  },
  y_etno: {
    en: {
      title: "Audited Yield — {{group1_tnos}} Rubin and Tracklet-Archive TNO Candidates",
      desc: "{{group1_tnos}} trans-Neptunian candidates from Rubin DP2 and the Minor Planet Center Isolated Tracklet File survive the audit, led by R25-D03 (a = 156.6 au, q = 35.78 au, i = 3.16°), R25-D09, and R25-E02.",
      fly: { focus: "DELTA_003" }
    }
  },
  y_stereo: {
    en: {
      title: "Audited Yield — {{euclid_tnos}} Euclid Trans-Neptunian Candidates",
      desc: "{{euclid_tnos}} Euclid slow movers survive the audit as trans-Neptunian candidates: EUC-S05 and EUC-S02 with DECam stereo counterparts, six in COSMOS, two in the ecliptic block, and three in the deep fields.",
      fly: { focus: "EUC0005" }
    }
  },
  y_gold: {
    en: {
      title: "Audited Yield — {{asteroids}} Short-Arc Asteroid Candidates & Control",
      desc: "{{asteroids}} Euclid asteroid candidates survive the audit ({{ees_asteroids}} in ecliptic fields seen in both VIS and NISP, including two at Trojan distance). Arcs under a day leave orbits and sizes open; 2019 UM31 serves as the recovery control.",
      fly: { focus: "EUCLID_EES149_GOLD_18" }
    }
  },
  y_vol: {
    en: {
      title: "Audited Yield — Confirmed CO and 12CO2 Emission",
      desc: "SPHEREx coma spectra confirm CO and 12CO2 emission in interstellar comet 3I/ATLAS and CO emission in Centaur 29P/Schwassmann–Wachmann 1; 13CO2 and water-ice absorption are not supported.",
      fly: { focus: "ATLAS_3I" }
    }
  }
};

/* ==========================================================================
   3. Real Astrometric Datasets for Interactive HTML5 <canvas> Widgets
   ========================================================================== */
const BLINK_TARGETS = {
  DELTA_003: {
    focusId: "DELTA_003",
    name: "R25-D03 (DELTA_003)",
    fovLabel: "110′ × 52′ Capricornus–Aquarius Ecliptic Field",
    raCenter: 348.36,
    decCenter: -8.09,
    spanDegRA: 1.85,
    spanDegDec: 0.88,
    starCount: 92,
    seed: 303,
    isStreak: false,
    note_en: "51.15 au TNO candidate · 12 detections / 124.8 d",
    fly_en: "Fly to R25-D03 in 3D ↗",
    fullCurve: [
      [349.09021, -7.79358],
      [349.07278, -7.80261],
      [348.77092, -7.94691],
      [348.62619, -8.01154],
      [348.61447, -8.01675],
      [348.35401, -8.12818],
      [347.64467, -8.38783],
      [347.63969, -8.38811]
    ],
    epochs: [
      { utc: "2025-07-20 06:12", mjd: 60876.2589, ra: 349.09021, dec: -7.79358, mag: "g = 24.53 ± 0.21 AB", snr: 5.4, color: "#63a4f4" },
      { utc: "2025-08-17 05:51", mjd: 60904.2443, ra: 348.77092, dec: -7.94691, mag: "r = 23.54 ± 0.18 AB", snr: 8.1, color: "#f0825b" },
      { utc: "2025-09-14 08:28", mjd: 60932.3529, ra: 348.35401, dec: -8.12818, mag: "z = 22.16 ± 0.18 AB", snr: 8.8, color: "#44c493" },
      { utc: "2025-11-21 02:10", mjd: 61001.0904, ra: 347.63969, dec: -8.38811, mag: "g = 24.31 ± 0.20 AB (Quadrature)", snr: 5.8, color: "#e4b14a" }
    ]
  },

  EPS_002: {
    focusId: "EPS_002",
    name: "R25-E02 (Galactic bulge b = +7.12°)",
    fovLabel: "38′ × 18′ Sagittarius–Ophiuchus Crowded Milky Way Field",
    raCenter: 264.216,
    decCenter: -18.7625,
    spanDegRA: 0.68,
    spanDegDec: 0.042,
    starCount: 410,
    seed: 502,
    isStreak: false,
    note_en: "50.86 au · TNO candidate against the Galactic bulge",
    fly_en: "Fly to R25-E02 in 3D ↗",
    fullCurve: [
      [264.46750, -18.76660],
      [264.32809, -18.76216],
      [264.14398, -18.75884],
      [264.11334, -18.75857],
      [264.09664, -18.75855],
      [263.96505, -18.75915]
    ],
    epochs: [
      { utc: "2025-06-22 02:19", mjd: 60848.0969, ra: 264.46750, dec: -18.76660, mag: "g = 22.82 AB", snr: 11.4, color: "#63a4f4" },
      { utc: "2025-06-30 02:04", mjd: 60856.0864, ra: 264.32809, dec: -18.76216, mag: "z = 21.43 AB", snr: 16.8, color: "#44c493" },
      { utc: "2025-07-11 04:24", mjd: 60867.1836, ra: 264.14398, dec: -18.75884, mag: "z = 21.42 AB", snr: 17.1, color: "#44c493" },
      { utc: "2025-07-23 04:47", mjd: 60879.1998, ra: 263.96505, dec: -18.75915, mag: "g = 23.05 AB", snr: 10.2, color: "#63a4f4" }
    ]
  },

  GOLD_18: {
    focusId: "EUCLID_EES149_GOLD_18",
    name: "2019 UM31 recovery control (EUC-G18)",
    fovLabel: "68″ × 40″ Euclid VIS 0.10″/px Space Focal Plane",
    raCenter: 9.7623,
    decCenter: 5.0772,
    spanDegRA: 0.019,
    spanDegDec: 0.0115,
    starCount: 44,
    seed: 618,
    isStreak: true,
    paDeg: 57.4,
    note_en: "Cataloged main-belt asteroid 2019 UM31 · recovery control",
    fly_en: "Fly to 2019 UM31 in 3D ↗",
    fullCurve: [
      [9.7556205, 5.0729656],
      [9.7597357, 5.0755840],
      [9.7656117, 5.0793337],
      [9.7689724, 5.0814618]
    ],
    epochs: [
      { utc: "2023-12-27 16:56:38", mjd: 60305.7060, ra: 9.7556205, dec: 5.0729656, mag: "I_E = 22.87 (560.5s Dither 1, L=7.7″)", snr: 14.2, color: "#44c493" },
      { utc: "2023-12-27 17:14:34", mjd: 60305.7184, ra: 9.7597357, dec: 5.0755840, mag: "I_E = 22.95 (560.5s Dither 2, L=6.3″)", snr: 13.5, color: "#44c493" },
      { utc: "2023-12-27 17:43:17", mjd: 60305.7384, ra: 9.7656117, dec: 5.0793337, mag: "I_E = 22.73 (560.5s Dither 3, L=6.8″)", snr: 15.1, color: "#44c493" },
      { utc: "2023-12-27 17:58:57", mjd: 60305.7493, ra: 9.7689724, dec: 5.0814618, mag: "I_E = 22.59 (560.5s Dither 4, L=6.5″)", snr: 16.0, color: "#44c493" }
    ]
  }
};

const STEREO_TARGETS = {
  EUC0005: {
    focusId: "EUC0005",
    name: "EUC-S05",
    utc: "2023-12-31 01:32 UTC",
    baselineKm: 1685391,
    raW84: 12.6148027,
    decW84: 5.6778804,
    raL2: 12.5999822,
    decL2: 5.6674518,
    parallaxArcsec: 64.19,
    dL2Au: 35.60,
    dErrAu: 0.15,
    rHelioAu: 35.69,
    snrCoadd: 11.14,
    magEuclid: 23.77,
    magDecam: 23.89,
    eMin: 0.164,
    aMin: 42.71,
    fly_en: "Fly to EUC-S05 in 3D ↗",
    seed: 905
  },
  EUC0002: {
    focusId: "EUC0002",
    name: "EUC-S02",
    utc: "2023-12-31 01:32 UTC",
    baselineKm: 1685391,
    raW84: 12.8322454,
    decW84: 5.7515252,
    raL2: 12.8170488,
    decL2: 5.7409973,
    parallaxArcsec: 66.47,
    dL2Au: 34.40,
    dErrAu: 0.15,
    rHelioAu: 34.50,
    snrCoadd: 7.85,
    magEuclid: 24.20,
    magDecam: 24.34,
    eMin: 0.110,
    aMin: 38.75,
    fly_en: "Fly to EUC-S02 in 3D ↗",
    seed: 902
  }
};

/* ==========================================================================
   4. Audit Summary and Audited Ledger
   Both constants are generated by the blog sync script (scripts/, sync_discovery_blog) from the
   compiled catalogue, the audit verdict files and the real-pixel manifests. Do not edit them by hand.
   ========================================================================== */
const AUDIT_SUMMARY =
{
  "claims": 157,
  "survivors": 93,
  "disputed": 17,
  "eliminated": 6,
  "catalogued": 41,
  "ungraded": 0,
  "per_object": 56,
  "per_claim": 37,
  "verified": 4,
  "plausible": 89,
  "tnos": 46,
  "euclid_tnos": 13,
  "group1_tnos": 33,
  "centaurs": 1,
  "moons": 3,
  "asteroids": 43,
  "ees_asteroids": 31,
  "controls": 2,
  "movie_targets": 96,
  "movie_discovery_targets": 94,
  "movie_controls": 2,
  "movie_frames": 388,
  "movie_single": 249,
  "movie_synthetic": 0,
  "movie_gaps": 0,
  "movie_no_epoch": 12,
  "movie_galactic": 25,
  "ledger_rows": 154,
  "ledger_survivors": 93,
  "ledger_disputed": 17,
  "ledger_known": 42,
  "ledger_volatile": 2,
  "ledger_group_etno": 35,
  "ledger_group_euclid_gold": 99,
  "ledger_group_moon_binary": 3,
  "ledger_group_stereo_kbo": 15,
  "ledger_group_volatile": 2,
  "recovery_controls": [
    "2019 UM31",
    "2021 QB98"
  ],
  "disputed_ids": [
    "EUCLID_DR1_C3_GOLD_15",
    "EUCLID_DR1_C3_GOLD_16",
    "SAT3_NEW_04",
    "SAT3_NEW_13",
    "SAT3_NEW_15",
    "SAT3_NEW_20",
    "SAT3_NEW_24",
    "SAT3_NEW_31",
    "SAT3_NEW_35",
    "SAT3_NEW_38",
    "SAT3_NEW_40",
    "SAT3_NEW_41",
    "SAT3_NEW_47",
    "SAT3_NEW_51",
    "SAT3_NEW_53",
    "SAT3_NEW_54",
    "SAT3_NEW_55"
  ],
  "eliminated_ids": [
    "ITF-02",
    "TNO_W1_03",
    "J25-M04",
    "C3_GOLD_03",
    "C3_GOLD_12",
    "C3_GOLD_14"
  ],
  "eliminated_list": "ITF-02, TNO_W1_03, J25-M04, C3_GOLD_03, C3_GOLD_12, C3_GOLD_14",
  "ledger_by_status": {
    "AUDITED_SURVIVOR": 93,
    "DISPUTED_CLAIM": 17,
    "RECOVERY_CONTROL": 2,
    "CATALOGUED_OBJECT": 40,
    "VOLATILE_TARGET": 2
  },
  "ledger_by_group": {
    "etno": 35,
    "stereo_kbo": 15,
    "euclid_gold": 99,
    "moon_binary": 3,
    "volatile": 2
  },
  "movie_by_group": {
    "controls": 2,
    "galactic": 25,
    "group1": 13,
    "group2": 13,
    "group5": 43
  },
  "words": {
    "en": {
      "claims": "one hundred fifty-seven",
      "survivors": "ninety-three",
      "disputed": "seventeen",
      "eliminated": "six",
      "catalogued": "forty-one",
      "ungraded": "zero",
      "per_object": "fifty-six",
      "per_claim": "thirty-seven",
      "verified": "four",
      "plausible": "eighty-nine",
      "tnos": "forty-six",
      "euclid_tnos": "thirteen",
      "group1_tnos": "thirty-three",
      "centaurs": "one",
      "moons": "three",
      "asteroids": "forty-three",
      "ees_asteroids": "thirty-one",
      "controls": "two",
      "movie_targets": "ninety-six",
      "movie_discovery_targets": "ninety-four",
      "movie_controls": "two",
      "movie_frames": "three hundred eighty-eight",
      "movie_single": "two hundred forty-nine",
      "movie_synthetic": "zero",
      "movie_gaps": "zero",
      "movie_no_epoch": "twelve",
      "movie_galactic": "twenty-five",
      "ledger_rows": "one hundred fifty-four",
      "ledger_survivors": "ninety-three",
      "ledger_disputed": "seventeen",
      "ledger_known": "forty-two",
      "ledger_volatile": "two",
      "ledger_group_etno": "thirty-five",
      "ledger_group_euclid_gold": "ninety-nine",
      "ledger_group_moon_binary": "three",
      "ledger_group_stereo_kbo": "fifteen",
      "ledger_group_volatile": "two"
    }
  }
};

const DISCOVERY_LEDGER =
  [
    {
      "id": "DELTA_003",
      "focusId": "DELTA_003",
      "label": "DELTA_003 (LSST-DP2-D03)",
      "group": "etno",
      "facility": "Rubin X05 (DiaSource ∪ Source)",
      "date": "2025-07-20..11-21 (124.8 d)",
      "ra": 348.62613,
      "dec": -8.01158,
      "mag": "23.40 r (12 hits)",
      "H": 6.38,
      "r_au": 51.15,
      "a_au": 156.58,
      "q_au": 35.78,
      "e": 0.772,
      "inc_deg": 3.157,
      "varpi_deg": 274.2,
      "T_N": 3.091,
      "size_label": "168–231 km",
      "size_km": 230.5,
      "note_en": "Audit: I-D03-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Real, uncatalogued distant object (r~51 au, i~3.2 deg), 12 detections on 8 nights over 124.8 d.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "R25-D03",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-D03-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "DELTA_004",
      "focusId": "DELTA_004",
      "label": "DELTA_004",
      "group": "etno",
      "facility": "Rubin X05 (dp2)",
      "date": "2025-07-01..2025-08-27 (57.0 d)",
      "ra": 335.45174,
      "dec": -9.27202,
      "mag": "23.81 r (10 hits)",
      "H": 6.77,
      "r_au": 51.08,
      "a_au": 54.23,
      "q_au": 29.74,
      "e": 0.452,
      "inc_deg": 14.72,
      "varpi_deg": 83.4,
      "T_N": 2.872,
      "size_label": "208 km",
      "size_km": 207.7,
      "note_en": "Audit: I-CORE-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Seven further new Rubin TNOs exist.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "R25-D04",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-CORE-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "DELTA_009",
      "focusId": "DELTA_009",
      "label": "DELTA_009",
      "group": "etno",
      "facility": "Rubin X05 + DECam W84",
      "date": "2022..2025 (1,173.0 d, 16 hits)",
      "ra": 341.1566,
      "dec": -5.57292,
      "mag": "23.59 r (9 hits)",
      "H": 6.91,
      "r_au": 47.04,
      "a_au": 47.553,
      "q_au": 45.13,
      "e": 0.051,
      "inc_deg": 7.38,
      "varpi_deg": 61.3,
      "T_N": 3.123,
      "size_label": "195 km",
      "size_km": 194.9,
      "note_en": "Audit: I-D09-01 [VERIFIED] 2022 DECam VR precovery (2022-08-30, 2022-08-31) is real.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "VERIFIED",
      "audit_id": "R25-D09",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-D09-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "DELTA_014",
      "focusId": "DELTA_014",
      "label": "DELTA_014",
      "group": "etno",
      "facility": "Rubin X05 (dp2)",
      "date": "2025-07-18..2025-08-28 (40.9 d)",
      "ra": 331.21242,
      "dec": -10.94143,
      "mag": "23.91 r (5 hits)",
      "H": 7.33,
      "r_au": 45.95,
      "a_au": 51.44,
      "q_au": 36.8,
      "e": 0.285,
      "inc_deg": 0.79,
      "varpi_deg": 245.1,
      "T_N": 3.092,
      "size_label": "160 km",
      "size_km": 160.4,
      "note_en": "Audit: I-CORE-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Seven further new Rubin TNOs exist.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "R25-D14",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-CORE-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "EPS_002",
      "focusId": "EPS_002",
      "label": "EPS_002",
      "group": "etno",
      "facility": "Rubin X05 + DECam W84 (b=+7.1°)",
      "date": "2024..2025 (461.9 d, 14 hits)",
      "ra": 264.12866,
      "dec": -18.759,
      "mag": "22.12 r (6 hits)",
      "H": 5.1,
      "r_au": 50.86,
      "a_au": 49.08,
      "q_au": 39.78,
      "e": 0.19,
      "inc_deg": 5.78,
      "varpi_deg": 65.6,
      "T_N": 3.114,
      "size_label": "449 km",
      "size_km": 448.8,
      "note_en": "Audit: I-E02-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Real, bright (r~22) uncatalogued TNO at Galactic latitude +7.1 deg.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "R25-E02",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-E02-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "EPS_007",
      "focusId": "EPS_007",
      "label": "EPS_007",
      "group": "etno",
      "facility": "Rubin X05 (b=-12.7°)",
      "date": "2025-06-21..2025-07-18 (26.9 d)",
      "ra": 285.86931,
      "dec": -22.70852,
      "mag": "22.62 r (12 hits)",
      "H": 6.07,
      "r_au": 45.65,
      "a_au": 41.99,
      "q_au": 28.96,
      "e": 0.31,
      "inc_deg": 1.0,
      "varpi_deg": 47.6,
      "T_N": 2.962,
      "size_label": "286 km",
      "size_km": 286.4,
      "note_en": "Audit: I-CORE-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Seven further new Rubin TNOs exist.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "R25-E07",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-CORE-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "EUC0005",
      "focusId": "EUC0005",
      "label": "EUC0005 (L2×W84 Stereo)",
      "group": "stereo_kbo",
      "facility": "Euclid 273 × DECam W84",
      "date": "2023-12-30..31 (Simultaneous)",
      "ra": 12.6148,
      "dec": 5.67788,
      "mag": "23.77 I_E / 23.89 ri",
      "H": 8.25,
      "r_au": 35.69,
      "a_au": 42.71,
      "q_au": 35.61,
      "e": 0.166,
      "inc_deg": 19.85,
      "varpi_deg": null,
      "T_N": 2.915,
      "size_label": "105 km",
      "size_km": 105.2,
      "note_en": "Audit (EUC-S05): Real Euclid slow mover; DECam counterpart reproducible, not static (Euclid stack and Legacy DR10 blank), empirical chance probability ~1-2% -> probable; distance credible if the match is real; a/e undetermined.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-S05",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-S05"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUC0002",
      "focusId": "EUC0002",
      "label": "EUC0002 (L2×W84 Stereo)",
      "group": "stereo_kbo",
      "facility": "Euclid 273 × DECam W84",
      "date": "2023-12-30..31 (Simultaneous)",
      "ra": 12.83225,
      "dec": 5.75152,
      "mag": "24.20 I_E / 24.34 ri",
      "H": 8.82,
      "r_au": 34.49,
      "a_au": 38.75,
      "q_au": 34.37,
      "e": 0.113,
      "inc_deg": 18.24,
      "varpi_deg": null,
      "T_N": 2.919,
      "size_label": "81 km",
      "size_km": 80.9,
      "note_en": "Audit (EUC-S02): Real Euclid slow mover; DECam counterpart reproducible, not static (Euclid stack and Legacy DR10 blank), empirical chance probability ~1-2% -> probable; distance credible if the match is real; a/e undetermined.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-S02",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-S02"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "OUTER_VIS_BLOCK_A_ECLIPTIC_SPINE_66332_66338_003",
      "focusId": "EUCLID_VIS_TNO_02",
      "label": "EUCLID_VIS_TNO_02",
      "group": "stereo_kbo",
      "facility": "Euclid 273 (VIS_QUAD 560s)",
      "date": "2023-12-30..31 (8.4 h)",
      "ra": 12.56984,
      "dec": 5.73758,
      "mag": "25.38 I_E",
      "H": 9.74,
      "r_au": 38.11,
      "a_au": 38.11,
      "q_au": 38.11,
      "e": 0.0,
      "inc_deg": 9.84,
      "varpi_deg": 184.5,
      "T_N": 3.007,
      "size_label": "53.0 km",
      "size_km": 53.0,
      "note_en": "Audit (EUC-V02): Real Euclid slow mover (cross-ROS pixels); ~8 h arc: distance admissible from <=5 to 54-65 au; r and e=0 are the circular assumption.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-V02",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-V02"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "OUTER_VIS_BLOCK_A_ECLIPTIC_SPINE_66338_66344_004",
      "focusId": "EUCLID_VIS_TNO_03",
      "label": "EUCLID_VIS_TNO_03",
      "group": "stereo_kbo",
      "facility": "Euclid 273 (VIS_QUAD 560s)",
      "date": "2023-12-30..31 (7.8 h)",
      "ra": 12.7228,
      "dec": 5.79659,
      "mag": "25.21 I_E",
      "H": 8.83,
      "r_au": 45.41,
      "a_au": 45.41,
      "q_au": 45.41,
      "e": 0.0,
      "inc_deg": 1.09,
      "varpi_deg": 205.8,
      "T_N": 3.12,
      "size_label": "80.6 km",
      "size_km": 80.6,
      "note_en": "Audit (EUC-V03): Real Euclid slow mover (cross-ROS pixels); ~8 h arc: distance admissible from <=5 to 54-65 au; r and e=0 are the circular assumption.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-V03",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-V03"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_01",
      "focusId": "EUCLID_EES149_GOLD_01",
      "label": "EES149_GOLD_01",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (15.9 h, 44 ep)",
      "ra": 8.17619,
      "dec": 3.46653,
      "mag": "22.81 I_E",
      "H": 17.98,
      "r_au": 2.715,
      "a_au": 2.709,
      "q_au": 2.701,
      "e": 0.003,
      "inc_deg": 1.09,
      "varpi_deg": 167.2,
      "T_N": 11.699,
      "size_label": "900 m",
      "size_km": 0.9,
      "note_en": "Audit (EUC-G01): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G01",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G01"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_02",
      "focusId": "EUCLID_EES149_GOLD_02",
      "label": "EES149_GOLD_02",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (13.5 h, 39 ep)",
      "ra": 8.95215,
      "dec": 3.48948,
      "mag": "22.73 I_E",
      "H": 17.93,
      "r_au": 2.697,
      "a_au": 2.702,
      "q_au": 2.696,
      "e": 0.002,
      "inc_deg": 2.39,
      "varpi_deg": 345.6,
      "T_N": 11.727,
      "size_label": "922 m",
      "size_km": 0.922,
      "note_en": "Audit (EUC-G02): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G02",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G02"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_03",
      "focusId": "EUCLID_EES149_GOLD_03",
      "label": "EES149_GOLD_03",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (19.6 h, 39 ep)",
      "ra": 8.84774,
      "dec": 3.75793,
      "mag": "22.77 I_E",
      "H": 18.99,
      "r_au": 2.104,
      "a_au": 2.114,
      "q_au": 2.094,
      "e": 0.009,
      "inc_deg": 6.84,
      "varpi_deg": 338.0,
      "T_N": 14.752,
      "size_label": "564 m",
      "size_km": 0.564,
      "note_en": "Audit (EUC-G03): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G03",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G03"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_04",
      "focusId": "EUCLID_EES149_GOLD_04",
      "label": "EES149_GOLD_04",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (11.9 h, 38 ep)",
      "ra": 7.41942,
      "dec": 3.79104,
      "mag": "23.10 I_E",
      "H": 19.18,
      "r_au": 2.174,
      "a_au": 2.185,
      "q_au": 2.165,
      "e": 0.009,
      "inc_deg": 4.82,
      "varpi_deg": 338.3,
      "T_N": 14.301,
      "size_label": "517 m",
      "size_km": 0.517,
      "note_en": "Audit (EUC-G04): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G04",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G04"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_05",
      "focusId": "EUCLID_EES149_GOLD_05",
      "label": "EES149_GOLD_05",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (16.0 h, 37 ep)",
      "ra": 12.83434,
      "dec": 5.22998,
      "mag": "23.11 I_E",
      "H": 18.44,
      "r_au": 2.612,
      "a_au": 2.616,
      "q_au": 2.611,
      "e": 0.002,
      "inc_deg": 6.56,
      "varpi_deg": 354.2,
      "T_N": 12.08,
      "size_label": "728 m",
      "size_km": 0.728,
      "note_en": "Audit (EUC-G05): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G05",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G05"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_06",
      "focusId": "EUCLID_EES149_GOLD_06",
      "label": "EES149_GOLD_06",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (16.0 h, 36 ep)",
      "ra": 11.21937,
      "dec": 4.91302,
      "mag": "23.02 I_E",
      "H": 19.35,
      "r_au": 2.055,
      "a_au": 2.078,
      "q_au": 2.02,
      "e": 0.028,
      "inc_deg": 5.55,
      "varpi_deg": 332.8,
      "T_N": 14.993,
      "size_label": "480 m",
      "size_km": 0.48,
      "note_en": "Audit (EUC-G06): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G06",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G06"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_07",
      "focusId": "EUCLID_EES149_GOLD_07",
      "label": "EES149_GOLD_07",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (15.3 h, 36 ep)",
      "ra": 12.56411,
      "dec": 4.76743,
      "mag": "23.23 I_E",
      "H": 18.51,
      "r_au": 2.641,
      "a_au": 2.649,
      "q_au": 2.638,
      "e": 0.004,
      "inc_deg": 8.98,
      "varpi_deg": 346.5,
      "T_N": 11.938,
      "size_label": "704 m",
      "size_km": 0.704,
      "note_en": "Audit (EUC-G07): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G07",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G07"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_08",
      "focusId": "EUCLID_EES149_GOLD_08",
      "label": "EES149_GOLD_08",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (19.7 h, 33 ep)",
      "ra": 12.8488,
      "dec": 4.73116,
      "mag": "22.92 I_E",
      "H": 18.45,
      "r_au": 2.486,
      "a_au": 2.499,
      "q_au": 2.478,
      "e": 0.009,
      "inc_deg": 4.92,
      "varpi_deg": 346.0,
      "T_N": 12.604,
      "size_label": "725 m",
      "size_km": 0.725,
      "note_en": "Audit (EUC-G08): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G08",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G08"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_09",
      "focusId": "EUCLID_EES149_GOLD_09",
      "label": "EES149_GOLD_09",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (8.4 h, 32 ep)",
      "ra": 11.46042,
      "dec": 5.32158,
      "mag": "23.21 I_E",
      "H": 18.29,
      "r_au": 2.779,
      "a_au": 2.779,
      "q_au": 2.778,
      "e": 0.0,
      "inc_deg": 2.16,
      "varpi_deg": 222.2,
      "T_N": 11.429,
      "size_label": "782 m",
      "size_km": 0.782,
      "note_en": "Audit (EUC-G09): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G09",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G09"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_10",
      "focusId": "EUCLID_EES149_GOLD_10",
      "label": "EES149_GOLD_10",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (16.0 h, 32 ep)",
      "ra": 10.6902,
      "dec": 3.95919,
      "mag": "23.34 I_E",
      "H": 19.52,
      "r_au": 2.126,
      "a_au": 2.129,
      "q_au": 2.122,
      "e": 0.004,
      "inc_deg": 7.16,
      "varpi_deg": 340.5,
      "T_N": 14.649,
      "size_label": "443 m",
      "size_km": 0.443,
      "note_en": "Audit (EUC-G10): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G10",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G10"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_11",
      "focusId": "EUCLID_EES149_GOLD_11",
      "label": "EES149_GOLD_11",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (15.6 h, 31 ep)",
      "ra": 7.88789,
      "dec": 2.58531,
      "mag": "22.75 I_E",
      "H": 18.08,
      "r_au": 2.613,
      "a_au": 2.616,
      "q_au": 2.612,
      "e": 0.002,
      "inc_deg": 2.64,
      "varpi_deg": 353.2,
      "T_N": 12.083,
      "size_label": "861 m",
      "size_km": 0.861,
      "note_en": "Audit (EUC-G11): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G11",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G11"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_12",
      "focusId": "EUCLID_EES149_GOLD_12",
      "label": "EES149_GOLD_12",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (8.4 h, 32 ep)",
      "ra": 9.52607,
      "dec": 4.17173,
      "mag": "23.22 I_E",
      "H": 18.33,
      "r_au": 2.752,
      "a_au": 2.752,
      "q_au": 2.752,
      "e": 0.0,
      "inc_deg": 2.27,
      "varpi_deg": 36.0,
      "T_N": 11.53,
      "size_label": "765 m",
      "size_km": 0.765,
      "note_en": "Audit (EUC-G12): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G12",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G12"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_13",
      "focusId": "EUCLID_EES149_GOLD_13",
      "label": "EES149_GOLD_13",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (11.9 h, 30 ep)",
      "ra": 7.77839,
      "dec": 2.32511,
      "mag": "22.86 I_E",
      "H": 18.22,
      "r_au": 2.592,
      "a_au": 2.59,
      "q_au": 2.586,
      "e": 0.001,
      "inc_deg": 2.12,
      "varpi_deg": 158.1,
      "T_N": 12.198,
      "size_label": "805 m",
      "size_km": 0.805,
      "note_en": "Audit (EUC-G13): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G13",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G13"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_14",
      "focusId": "EUCLID_EES149_GOLD_14",
      "label": "EES149_GOLD_14",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (19.3 h, 30 ep)",
      "ra": 12.86266,
      "dec": 5.18042,
      "mag": "23.12 I_E",
      "H": 19.59,
      "r_au": 1.985,
      "a_au": 2.0,
      "q_au": 1.963,
      "e": 0.018,
      "inc_deg": 3.59,
      "varpi_deg": 336.7,
      "T_N": 15.553,
      "size_label": "429 m",
      "size_km": 0.429,
      "note_en": "Audit (EUC-G14): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G14",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G14"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_15",
      "focusId": "EUCLID_EES149_GOLD_15",
      "label": "EES149_GOLD_15",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (16.0 h, 29 ep)",
      "ra": 7.09032,
      "dec": 3.89761,
      "mag": "23.11 I_E",
      "H": 19.1,
      "r_au": 2.225,
      "a_au": 2.217,
      "q_au": 2.207,
      "e": 0.004,
      "inc_deg": 3.71,
      "varpi_deg": 182.8,
      "T_N": 14.106,
      "size_label": "537 m",
      "size_km": 0.537,
      "note_en": "Audit (EUC-G15): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G15",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G15"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_16",
      "focusId": "EUCLID_EES149_GOLD_16",
      "label": "EES149_GOLD_16",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (16.0 h, 27 ep)",
      "ra": 11.0763,
      "dec": 4.65724,
      "mag": "22.76 I_E",
      "H": 19.75,
      "r_au": 1.76,
      "a_au": 1.765,
      "q_au": 1.729,
      "e": 0.02,
      "inc_deg": 27.82,
      "varpi_deg": 129.5,
      "T_N": 17.461,
      "size_label": "398 m",
      "size_km": 0.398,
      "note_en": "Audit (EUC-G16): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G16",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G16"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_17",
      "focusId": "EUCLID_EES149_GOLD_17",
      "label": "EES149_GOLD_17",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (19.6 h, 27 ep)",
      "ra": 8.61549,
      "dec": 4.3602,
      "mag": "22.81 I_E",
      "H": 18.83,
      "r_au": 2.212,
      "a_au": 2.214,
      "q_au": 2.199,
      "e": 0.006,
      "inc_deg": 18.43,
      "varpi_deg": 118.5,
      "T_N": 14.098,
      "size_label": "610 m",
      "size_km": 0.61,
      "note_en": "Audit (EUC-G17): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G17",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G17"
      ],
      "known_designation": null,
      "orbit_audit": "INVALID_OR_UNSUPPORTED"
    },
    {
      "id": "EUCLID_EES149_GOLD_19",
      "focusId": "EUCLID_EES149_GOLD_19",
      "label": "EES149_GOLD_19",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (12.2 h, 26 ep)",
      "ra": 7.65758,
      "dec": 3.60161,
      "mag": "23.02 I_E",
      "H": 18.41,
      "r_au": 2.57,
      "a_au": 2.572,
      "q_au": 2.568,
      "e": 0.001,
      "inc_deg": 1.18,
      "varpi_deg": 342.6,
      "T_N": 12.277,
      "size_label": "738 m",
      "size_km": 0.738,
      "note_en": "Audit (EUC-G19): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G19",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G19"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_20",
      "focusId": "EUCLID_EES149_GOLD_20",
      "label": "EES149_GOLD_20",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (8.4 h, 26 ep)",
      "ra": 11.40818,
      "dec": 5.04204,
      "mag": "23.07 I_E",
      "H": 18.8,
      "r_au": 2.368,
      "a_au": 2.371,
      "q_au": 2.365,
      "e": 0.002,
      "inc_deg": 3.2,
      "varpi_deg": 340.4,
      "T_N": 13.243,
      "size_label": "616 m",
      "size_km": 0.616,
      "note_en": "Audit (EUC-G20): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G20",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G20"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_21",
      "focusId": "EUCLID_EES149_GOLD_21",
      "label": "EES149_GOLD_21",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (19.6 h, 26 ep)",
      "ra": 8.60698,
      "dec": 2.72371,
      "mag": "23.37 I_E",
      "H": 18.74,
      "r_au": 2.584,
      "a_au": 2.599,
      "q_au": 2.577,
      "e": 0.008,
      "inc_deg": 2.31,
      "varpi_deg": 343.6,
      "T_N": 12.158,
      "size_label": "634 m",
      "size_km": 0.634,
      "note_en": "Audit (EUC-G21): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G21",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G21"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_22",
      "focusId": "EUCLID_EES149_GOLD_22",
      "label": "EES149_GOLD_22",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (12.2 h, 25 ep)",
      "ra": 7.31754,
      "dec": 4.00159,
      "mag": "22.84 I_E",
      "H": 18.02,
      "r_au": 2.709,
      "a_au": 2.71,
      "q_au": 2.709,
      "e": 0.0,
      "inc_deg": 7.15,
      "varpi_deg": 14.3,
      "T_N": 11.692,
      "size_label": "883 m",
      "size_km": 0.883,
      "note_en": "Audit (EUC-G22): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G22",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G22"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_23",
      "focusId": "EUCLID_EES149_GOLD_23",
      "label": "EES149_GOLD_23",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (8.4 h, 25 ep)",
      "ra": 10.65459,
      "dec": 3.79818,
      "mag": "23.11 I_E",
      "H": 19.62,
      "r_au": 1.971,
      "a_au": 1.967,
      "q_au": 1.958,
      "e": 0.004,
      "inc_deg": 4.81,
      "varpi_deg": 155.7,
      "T_N": 15.795,
      "size_label": "424 m",
      "size_km": 0.424,
      "note_en": "Audit (EUC-G23): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G23",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G23"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_24",
      "focusId": "EUCLID_EES149_GOLD_24",
      "label": "EES149_GOLD_24",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (19.4 h, 25 ep)",
      "ra": 8.66896,
      "dec": 4.78211,
      "mag": "23.32 I_E",
      "H": 18.67,
      "r_au": 2.596,
      "a_au": 2.607,
      "q_au": 2.589,
      "e": 0.007,
      "inc_deg": 4.96,
      "varpi_deg": 340.6,
      "T_N": 12.121,
      "size_label": "654 m",
      "size_km": 0.654,
      "note_en": "Audit (EUC-G24): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G24",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G24"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_25",
      "focusId": "EUCLID_EES149_GOLD_25",
      "label": "EES149_GOLD_25",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (12.2 h, 24 ep)",
      "ra": 7.00033,
      "dec": 2.80257,
      "mag": "22.90 I_E",
      "H": 18.3,
      "r_au": 2.567,
      "a_au": 2.569,
      "q_au": 2.566,
      "e": 0.001,
      "inc_deg": 3.78,
      "varpi_deg": 339.7,
      "T_N": 12.287,
      "size_label": "778 m",
      "size_km": 0.778,
      "note_en": "Audit (EUC-G25): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G25",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G25"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_26",
      "focusId": "EUCLID_EES149_GOLD_26",
      "label": "EES149_GOLD_26",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (6.9 h, 23 ep)",
      "ra": 7.27162,
      "dec": 2.79051,
      "mag": "22.87 I_E",
      "H": 17.73,
      "r_au": 2.934,
      "a_au": 2.934,
      "q_au": 2.934,
      "e": 0.0,
      "inc_deg": 12.43,
      "varpi_deg": 204.5,
      "T_N": 10.859,
      "size_label": "1011 m",
      "size_km": 1.011,
      "note_en": "Audit (EUC-G26): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G26",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G26"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_27",
      "focusId": "EUCLID_EES149_GOLD_27",
      "label": "EES149_GOLD_27",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (12.2 h, 21 ep)",
      "ra": 7.99795,
      "dec": 3.97362,
      "mag": "22.93 I_E",
      "H": 18.12,
      "r_au": 2.704,
      "a_au": 2.702,
      "q_au": 2.699,
      "e": 0.001,
      "inc_deg": 1.96,
      "varpi_deg": 168.8,
      "T_N": 11.728,
      "size_label": "844 m",
      "size_km": 0.844,
      "note_en": "Audit (EUC-G27): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G27",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G27"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_28",
      "focusId": "EUCLID_EES149_GOLD_28",
      "label": "EES149_GOLD_28",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (12.3 h, 23 ep)",
      "ra": 9.90691,
      "dec": 4.35907,
      "mag": "23.04 I_E",
      "H": 18.46,
      "r_au": 2.556,
      "a_au": 2.557,
      "q_au": 2.556,
      "e": 0.001,
      "inc_deg": 2.27,
      "varpi_deg": 0.2,
      "T_N": 12.342,
      "size_label": "723 m",
      "size_km": 0.723,
      "note_en": "Audit (EUC-G28): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G28",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G28"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_29",
      "focusId": "EUCLID_EES149_GOLD_29",
      "label": "EES149_GOLD_29",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (11.9 h, 22 ep)",
      "ra": 6.33326,
      "dec": 3.79788,
      "mag": "23.55 I_E",
      "H": 19.35,
      "r_au": 2.328,
      "a_au": 2.33,
      "q_au": 2.328,
      "e": 0.001,
      "inc_deg": 4.66,
      "varpi_deg": 354.3,
      "T_N": 13.457,
      "size_label": "479 m",
      "size_km": 0.479,
      "note_en": "Audit (EUC-G29): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G29",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G29"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_30",
      "focusId": "EUCLID_EES149_GOLD_30",
      "label": "EES149_GOLD_30",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (8.4 h, 20 ep)",
      "ra": 9.98355,
      "dec": 4.85097,
      "mag": "22.97 I_E",
      "H": 19.8,
      "r_au": 1.831,
      "a_au": 1.83,
      "q_au": 1.828,
      "e": 0.001,
      "inc_deg": 3.47,
      "varpi_deg": 296.5,
      "T_N": 16.922,
      "size_label": "390 m",
      "size_km": 0.39,
      "note_en": "Audit (EUC-G30): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G30",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G30"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_31",
      "focusId": "EUCLID_EES149_GOLD_31",
      "label": "EES149_GOLD_31",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (12.2 h, 20 ep)",
      "ra": 10.04382,
      "dec": 4.34673,
      "mag": "23.00 I_E",
      "H": 18.07,
      "r_au": 2.781,
      "a_au": 2.781,
      "q_au": 2.781,
      "e": 0.0,
      "inc_deg": 8.29,
      "varpi_deg": 346.5,
      "T_N": 11.413,
      "size_label": "864 m",
      "size_km": 0.864,
      "note_en": "Audit (EUC-G31): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G31",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G31"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_EES149_GOLD_32",
      "focusId": "EUCLID_EES149_GOLD_32",
      "label": "EES149_GOLD_32",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (8.2 h, 20 ep)",
      "ra": 6.56112,
      "dec": 3.28132,
      "mag": "23.38 I_E",
      "H": 19.39,
      "r_au": 2.212,
      "a_au": 2.2,
      "q_au": 2.184,
      "e": 0.007,
      "inc_deg": 8.62,
      "varpi_deg": 171.6,
      "T_N": 14.201,
      "size_label": "470 m",
      "size_km": 0.47,
      "note_en": "Audit (EUC-G32): Real-looking Euclid mover with no catalogued match from the Euclid viewpoint; single <24 h apparition, orbit undetermined (tabulated a,e,i are a prior-driven circular solution).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-G32",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G32"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "THETA_007",
      "focusId": "THETA_007",
      "label": "R25-T07",
      "group": "etno",
      "facility": "Vera C. Rubin LSST (dp2, MPC X05)",
      "date": "29.1 d",
      "ra": 317.12711,
      "dec": -23.82968,
      "mag": "23.62 AB",
      "H": 7.01,
      "r_au": 46.25,
      "a_au": 44.19,
      "q_au": 39.29,
      "e": 0.111,
      "inc_deg": 8.33,
      "varpi_deg": 191.3,
      "T_N": 3.065,
      "size_label": "186 km",
      "size_km": 186.3,
      "note_en": "Audit: I-CORE-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Seven further new Rubin TNOs exist.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "R25-T07",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-CORE-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "THETA_009",
      "focusId": "THETA_009",
      "label": "R25-T09",
      "group": "etno",
      "facility": "Vera C. Rubin LSST (dp2, MPC X05)",
      "date": "54.1 d",
      "ra": 318.74829,
      "dec": -18.98919,
      "mag": "23.61 AB",
      "H": 7.13,
      "r_au": 44.86,
      "a_au": 43.82,
      "q_au": 41.8,
      "e": 0.046,
      "inc_deg": 2.85,
      "varpi_deg": 191.7,
      "T_N": 3.095,
      "size_label": "176 km",
      "size_km": 175.8,
      "note_en": "Audit: I-CORE-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Seven further new Rubin TNOs exist.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "R25-T09",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-CORE-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "THETA_012",
      "focusId": "THETA_012",
      "label": "R25-T12 / CAMP2_003",
      "group": "etno",
      "facility": "Vera C. Rubin LSST (dp2, MPC X05)",
      "date": "38.1 d",
      "ra": 322.74398,
      "dec": -23.43996,
      "mag": "23.04 AB",
      "H": 6.69,
      "r_au": 43.63,
      "a_au": 47.08,
      "q_au": 37.75,
      "e": 0.198,
      "inc_deg": 9.67,
      "varpi_deg": 36.8,
      "T_N": 3.057,
      "size_label": "216 km",
      "size_km": 215.8,
      "note_en": "Audit: I-CORE-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Seven further new Rubin TNOs exist.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "R25-T12",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-CORE-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "THETA_013",
      "focusId": "THETA_013",
      "label": "R25-T13",
      "group": "etno",
      "facility": "Vera C. Rubin LSST (dp2, MPC X05)",
      "date": "65.0 d",
      "ra": 318.93587,
      "dec": -18.43521,
      "mag": "23.82 AB",
      "H": 7.46,
      "r_au": 43.66,
      "a_au": 46.99,
      "q_au": 37.09,
      "e": 0.211,
      "inc_deg": 3.16,
      "varpi_deg": 233.3,
      "T_N": 3.08,
      "size_label": "151 km",
      "size_km": 151.0,
      "note_en": "Audit: I-CORE-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Seven further new Rubin TNOs exist.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "R25-T13",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-CORE-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "KAPPA_COSMOS_EN_01",
      "focusId": "KAPPA_COSMOS_EN_01",
      "label": "EUC-CN01",
      "group": "stereo_kbo",
      "facility": "ESA Euclid DR1 VIS_QUAD (MPC 273)",
      "date": "99.37 h",
      "ra": 150.80359,
      "dec": 2.56274,
      "mag": "25.28 AB",
      "H": 9.42,
      "r_au": 40.04,
      "a_au": 41.05,
      "q_au": 40.04,
      "e": 0.025,
      "inc_deg": 10.27,
      "varpi_deg": 152.4,
      "T_N": 3.031,
      "size_label": "61 km",
      "size_km": 61.329,
      "note_en": "Audit (EUC-CN01): Real Euclid slow mover on pixels across 4-5 ROS; topocentric distance independently reproduced by two Keplerian analyses; no catalogued match; a/e undetermined from a 4-5 day arc.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "VERIFIED",
      "audit_id": "EUC-CN01",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-CN01"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "KAPPA_COSMOS_ES_02",
      "focusId": "KAPPA_COSMOS_ES_02",
      "label": "EUC-CS02",
      "group": "stereo_kbo",
      "facility": "ESA Euclid DR1 VIS_QUAD (MPC 273)",
      "date": "123.99 h",
      "ra": 150.39884,
      "dec": 1.58153,
      "mag": "25.17 AB",
      "H": 9.07,
      "r_au": 42.44,
      "a_au": 77.12,
      "q_au": 42.43,
      "e": 0.45,
      "inc_deg": 31.03,
      "varpi_deg": 149.6,
      "T_N": 2.841,
      "size_label": "72 km",
      "size_km": 72.17,
      "note_en": "Audit (EUC-CS02): Real Euclid slow mover on pixels across 4-5 ROS; topocentric distance independently reproduced by two Keplerian analyses; no catalogued match; a/e undetermined from a 4-5 day arc.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "VERIFIED",
      "audit_id": "EUC-CS02",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-CS02"
      ],
      "known_designation": null,
      "orbit_audit": "INVALID_OR_UNSUPPORTED"
    },
    {
      "id": "KAPPA_COSMOS_ES_03",
      "focusId": "KAPPA_COSMOS_ES_03",
      "label": "EUC-CS03",
      "group": "stereo_kbo",
      "facility": "ESA Euclid DR1 VIS_QUAD (MPC 273)",
      "date": "123.99 h",
      "ra": 150.42911,
      "dec": 1.5502,
      "mag": "24.85 AB",
      "H": 9.16,
      "r_au": 38.53,
      "a_au": 40.33,
      "q_au": 38.53,
      "e": 0.045,
      "inc_deg": 22.75,
      "varpi_deg": 154.0,
      "T_N": 2.88,
      "size_label": "69 km",
      "size_km": 69.168,
      "note_en": "Audit (EUC-CS03): Not pixel-tested; topocentric distance independently reproduced by two Keplerian analyses; no catalogued match; a/e undetermined from a 4-5 day arc.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-CS03",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-CS03"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "KAPPA_COSMOS_WN_04",
      "focusId": "KAPPA_COSMOS_WN_04",
      "label": "EUC-CW04",
      "group": "stereo_kbo",
      "facility": "ESA Euclid DR1 VIS_QUAD (MPC 273)",
      "date": "123.99 h",
      "ra": 149.94878,
      "dec": 2.67761,
      "mag": "23.88 AB",
      "H": 7.8,
      "r_au": 42.29,
      "a_au": 44.25,
      "q_au": 42.29,
      "e": 0.044,
      "inc_deg": 28.0,
      "varpi_deg": 149.1,
      "T_N": 2.82,
      "size_label": "129 km",
      "size_km": 129.493,
      "note_en": "Audit (EUC-CW04): Real Euclid slow mover on pixels across 4-5 ROS; topocentric distance independently reproduced by two Keplerian analyses; no catalogued match; a/e undetermined from a 4-5 day arc.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "VERIFIED",
      "audit_id": "EUC-CW04",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-CW04"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "KAPPA_COSMOS_WS_05",
      "focusId": "KAPPA_COSMOS_WS_05",
      "label": "EUC-CW05",
      "group": "stereo_kbo",
      "facility": "ESA Euclid DR1 VIS_QUAD (MPC 273)",
      "date": "123.99 h",
      "ra": 149.30033,
      "dec": 1.77939,
      "mag": "25.21 AB",
      "H": 9.32,
      "r_au": 40.39,
      "a_au": 41.52,
      "q_au": 40.39,
      "e": 0.027,
      "inc_deg": 13.53,
      "varpi_deg": 150.2,
      "T_N": 3.008,
      "size_label": "64 km",
      "size_km": 64.387,
      "note_en": "Audit (EUC-CW05): Not pixel-tested; topocentric distance independently reproduced by two Keplerian analyses; no catalogued match; a/e undetermined from a 4-5 day arc.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-CW05",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-CW05"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "KAPPA_COSMOS_WS_06",
      "focusId": "KAPPA_COSMOS_WS_06",
      "label": "EUC-CW06",
      "group": "stereo_kbo",
      "facility": "ESA Euclid DR1 VIS_QUAD (MPC 273)",
      "date": "94.15 h",
      "ra": 150.0273,
      "dec": 2.06892,
      "mag": "25.19 AB",
      "H": 8.64,
      "r_au": 47.18,
      "a_au": 47.34,
      "q_au": 47.18,
      "e": 0.003,
      "inc_deg": 10.12,
      "varpi_deg": 152.2,
      "T_N": 3.106,
      "size_label": "88 km",
      "size_km": 87.72,
      "note_en": "Audit (EUC-CW06): Not pixel-tested; topocentric distance independently reproduced by two Keplerian analyses; no catalogued match; a/e undetermined from a 4-5 day arc.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-CW06",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-CW06"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "KAPPA_COSMOS_NIR_01",
      "focusId": "KAPPA_COSMOS_NIR_01",
      "label": "EUC-J01",
      "group": "euclid_gold",
      "facility": "ESA Euclid DR1 NISP + VIS_QUAD (MP",
      "date": "25.51 h",
      "ra": 149.53883,
      "dec": 1.94756,
      "mag": "23.10 AB",
      "H": 16.23,
      "r_au": 4.938,
      "a_au": 4.9,
      "q_au": 4.86,
      "e": 0.008,
      "inc_deg": 26.91,
      "varpi_deg": 334.8,
      "T_N": 6.858,
      "size_label": "2.85 km",
      "size_km": 2.852,
      "note_en": "Audit (EUC-J01): Real Euclid mover (NISP catalogue rows + VIS trails found by this audit), no catalogued match; ~1-day arc: distance constrained by parallax, a/e/class not.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-J01",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-J01"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "KAPPA_COSMOS_NIR_02",
      "focusId": "KAPPA_COSMOS_NIR_02",
      "label": "EUC-J02",
      "group": "euclid_gold",
      "facility": "ESA Euclid DR1 NISP + VIS_QUAD (MP",
      "date": "29.24 h",
      "ra": 150.04558,
      "dec": 2.03567,
      "mag": "23.18 AB",
      "H": 16.35,
      "r_au": 4.882,
      "a_au": 4.95,
      "q_au": 4.88,
      "e": 0.014,
      "inc_deg": 12.44,
      "varpi_deg": 160.7,
      "T_N": 6.873,
      "size_label": "2.69 km",
      "size_km": 2.695,
      "note_en": "Audit (EUC-J02): Real Euclid mover (NISP catalogue rows + VIS trails found by this audit), no catalogued match; ~1-day arc: distance constrained by parallax, a/e/class not.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-J02",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-J02"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "KAPPA_COSMOS_NIR_03",
      "focusId": "KAPPA_COSMOS_NIR_03",
      "label": "EUC-M03",
      "group": "euclid_gold",
      "facility": "ESA Euclid DR1 NISP + VIS_QUAD (MP",
      "date": "20.59 h",
      "ra": 149.51036,
      "dec": 2.33074,
      "mag": "23.12 AB",
      "H": 18.26,
      "r_au": 2.953,
      "a_au": 2.95,
      "q_au": 2.95,
      "e": 0.0,
      "inc_deg": 11.04,
      "varpi_deg": 165.4,
      "T_N": 10.795,
      "size_label": "0.85 km",
      "size_km": 0.855,
      "note_en": "Audit (EUC-M03): Real Euclid mover (NISP catalogue rows + VIS trails found by this audit), no catalogued match; ~1-day arc: distance constrained by parallax, a/e/class not.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-M03",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-M03"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "KAPPA_COSMOS_NIR_04",
      "focusId": "KAPPA_COSMOS_NIR_04",
      "label": "EUC-M01",
      "group": "euclid_gold",
      "facility": "ESA Euclid DR1 NISP + VIS_QUAD (MP",
      "date": "20.62 h",
      "ra": 150.29814,
      "dec": 2.78681,
      "mag": "23.05 AB",
      "H": 18.32,
      "r_au": 2.849,
      "a_au": 2.88,
      "q_au": 2.83,
      "e": 0.017,
      "inc_deg": 18.07,
      "varpi_deg": 176.4,
      "T_N": 11.019,
      "size_label": "0.83 km",
      "size_km": 0.833,
      "note_en": "Audit (EUC-M01): Real Euclid mover (NISP catalogue rows + VIS trails found by this audit), no catalogued match; ~1-day arc: distance constrained by parallax, a/e/class not.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-M01",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-M01"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "KAPPA_COSMOS_NIR_05",
      "focusId": "KAPPA_COSMOS_NIR_05",
      "label": "EUC-M02",
      "group": "euclid_gold",
      "facility": "ESA Euclid DR1 NISP + VIS_QUAD (MP",
      "date": "20.66 h",
      "ra": 149.60342,
      "dec": 2.65261,
      "mag": "22.94 AB",
      "H": 18.1,
      "r_au": 2.944,
      "a_au": 3.0,
      "q_au": 2.92,
      "e": 0.027,
      "inc_deg": 8.55,
      "varpi_deg": 174.8,
      "T_N": 10.632,
      "size_label": "0.92 km",
      "size_km": 0.922,
      "note_en": "Audit (EUC-M02): Real Euclid mover (NISP catalogue rows + VIS trails found by this audit), no catalogued match; ~1-day arc: distance constrained by parallax, a/e/class not.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "EUC-M02",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-M02"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "CENTAUR_343_IOTA004",
      "focusId": "CENTAUR_343_IOTA004",
      "label": "R25-I04 / CENTAUR_343.4_-14.",
      "group": "etno",
      "facility": "Vera C. Rubin LSST (dp2) + NASA SP",
      "date": "32 detections across 1",
      "ra": 343.0912,
      "dec": -14.4064,
      "mag": "20.93 AB",
      "H": 10.48,
      "r_au": 12.255,
      "a_au": 16.67,
      "q_au": 11.75,
      "e": 0.295,
      "inc_deg": 12.5,
      "varpi_deg": 10.0,
      "T_N": 3.193,
      "size_label": "33–47 km",
      "size_km": 45.0,
      "note_en": "Audit: IV-I04-02 [VERIFIED] Not a catalogued object. IV-I04-03 [PLAUSIBLE_NEEDS_FOLLOWUP] Genuine new inbound Centaur.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "R25-I04",
      "audit_grade_level": "claim",
      "audit_entries": [
        "IV-I04-02",
        "IV-I04-03"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "W3A_ITF_003",
      "focusId": "W3A_ITF_003",
      "label": "W3A_ITF_003",
      "group": "etno",
      "facility": "Global MPC ITF (Station T09) + GPU",
      "date": "35.925 d",
      "ra": 341.31712,
      "dec": -0.22533,
      "mag": "24.96 AB",
      "H": 9.18,
      "r_au": 38.13,
      "a_au": 44.97,
      "q_au": 37.21,
      "e": 0.172,
      "inc_deg": 23.28,
      "varpi_deg": 309.7,
      "T_N": 2.882,
      "size_label": "69–97 km",
      "size_km": 68.7,
      "note_en": "Audit: I-ITF-02 [PLAUSIBLE_NEEDS_FOLLOWUP] Five further real outer-system objects linked from the MPC ITF.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "ITF-01",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-ITF-02"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "W3A_ITF_016",
      "focusId": "W3A_ITF_016",
      "label": "W3A_ITF_016",
      "group": "etno",
      "facility": "Global MPC ITF (Station T09) + GPU",
      "date": "81.786 d",
      "ra": 332.05571,
      "dec": 0.32465,
      "mag": "24.20 AB",
      "H": 8.29,
      "r_au": 39.27,
      "a_au": 106.18,
      "q_au": 36.23,
      "e": 0.659,
      "inc_deg": 20.53,
      "varpi_deg": 12.0,
      "T_N": 2.931,
      "size_label": "103–146 km",
      "size_km": 103.4,
      "note_en": "Audit: I-ITF-02 [PLAUSIBLE_NEEDS_FOLLOWUP] Five further real outer-system objects linked from the MPC ITF.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "ITF-03",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-ITF-02"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "W3A_ITF_017",
      "focusId": "W3A_ITF_017",
      "label": "W3A_ITF_017",
      "group": "etno",
      "facility": "Global MPC ITF (Station T09) + GPU",
      "date": "38.039 d",
      "ra": 35.92688,
      "dec": -5.35725,
      "mag": "26.02 AB",
      "H": 10.33,
      "r_au": 37.29,
      "a_au": 68.81,
      "q_au": 34.0,
      "e": 0.506,
      "inc_deg": 18.49,
      "varpi_deg": 350.1,
      "T_N": 2.912,
      "size_label": "40–57 km",
      "size_km": 44.0,
      "note_en": "Audit: I-ITF-02 [PLAUSIBLE_NEEDS_FOLLOWUP] Five further real outer-system objects linked from the MPC ITF.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "ITF-04",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-ITF-02"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "W3A_ITF_028",
      "focusId": "W3A_ITF_028",
      "label": "W3A_ITF_028",
      "group": "etno",
      "facility": "Global MPC ITF (Station T09) + GPU",
      "date": "56.927 d",
      "ra": 31.41879,
      "dec": -4.14194,
      "mag": "25.00 AB",
      "H": 9.05,
      "r_au": 39.61,
      "a_au": 59.59,
      "q_au": 26.19,
      "e": 0.561,
      "inc_deg": 18.16,
      "varpi_deg": 303.7,
      "T_N": 2.72,
      "size_label": "73–103 km",
      "size_km": 72.8,
      "note_en": "Audit: I-ITF-02 [PLAUSIBLE_NEEDS_FOLLOWUP] Five further real outer-system objects linked from the MPC ITF.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "ITF-05",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-ITF-02"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "W3A_ITF_041",
      "focusId": "W3A_ITF_041",
      "label": "W3A_ITF_041",
      "group": "etno",
      "facility": "Global MPC ITF (Station T09) + GPU",
      "date": "59.708 d",
      "ra": 151.22762,
      "dec": -0.66414,
      "mag": "24.45 AB",
      "H": 8.26,
      "r_au": 41.88,
      "a_au": 60.72,
      "q_au": 36.18,
      "e": 0.404,
      "inc_deg": 11.64,
      "varpi_deg": 211.4,
      "T_N": 3.041,
      "size_label": "105–148 km",
      "size_km": 104.9,
      "note_en": "Audit: I-ITF-02 [PLAUSIBLE_NEEDS_FOLLOWUP] Five further real outer-system objects linked from the MPC ITF.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "ITF-06",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-ITF-02"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "ZETA_002",
      "focusId": "ZETA_002",
      "label": "ZETA_002",
      "group": "etno",
      "facility": "Vera C. Rubin LSST (dp2 Hybrid) + ",
      "date": "129.8 d",
      "ra": 359.8996,
      "dec": 9.73745,
      "mag": "22.30 AB",
      "H": 5.1,
      "r_au": 52.73,
      "a_au": 89.89,
      "q_au": 43.51,
      "e": 0.516,
      "inc_deg": 28.95,
      "varpi_deg": 61.4,
      "T_N": 2.926,
      "size_label": "449–634 km",
      "size_km": 448.6,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "ZETA_002",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "ZETA_004",
      "focusId": "ZETA_004",
      "label": "ZETA_004",
      "group": "etno",
      "facility": "Vera C. Rubin LSST (dp2 Hybrid) + ",
      "date": "57.8 d",
      "ra": 352.17455,
      "dec": 2.22504,
      "mag": "23.25 AB",
      "H": 6.4,
      "r_au": 48.67,
      "a_au": 46.65,
      "q_au": 37.73,
      "e": 0.191,
      "inc_deg": 7.93,
      "varpi_deg": 239.4,
      "T_N": 3.066,
      "size_label": "247–349 km",
      "size_km": 246.6,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "ZETA_004",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "CAMP2_001",
      "focusId": "CAMP2_001",
      "label": "CAMP2_001 / TNO_286.5",
      "group": "etno",
      "facility": "Vera C. Rubin LSST (dp2 Hybrid) + ",
      "date": "30.9 d",
      "ra": 286.52057,
      "dec": -24.79278,
      "mag": "22.84 AB",
      "H": 6.67,
      "r_au": 41.67,
      "a_au": 118.71,
      "q_au": 38.47,
      "e": 0.676,
      "inc_deg": 19.63,
      "varpi_deg": 321.5,
      "T_N": 3.012,
      "size_label": "218–308 km",
      "size_km": 218.0,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "CAMP2_001",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "CAMP2_002",
      "focusId": "CAMP2_002",
      "label": "CAMP2_002",
      "group": "etno",
      "facility": "Vera C. Rubin LSST (dp2 Hybrid) + ",
      "date": "31.9 d",
      "ra": 296.50966,
      "dec": -12.51298,
      "mag": "23.23 AB",
      "H": 6.95,
      "r_au": 42.65,
      "a_au": 42.06,
      "q_au": 40.23,
      "e": 0.044,
      "inc_deg": 15.85,
      "varpi_deg": 185.6,
      "T_N": 2.988,
      "size_label": "191–270 km",
      "size_km": 191.3,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "CAMP2_002",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "CAMP2_004",
      "focusId": "CAMP2_004",
      "label": "CAMP2_004",
      "group": "etno",
      "facility": "Vera C. Rubin LSST (dp2 Hybrid) + ",
      "date": "28.9 d",
      "ra": 239.35063,
      "dec": -29.65595,
      "mag": "22.70 AB",
      "H": 7.61,
      "r_au": 32.56,
      "a_au": 134.53,
      "q_au": 25.88,
      "e": 0.808,
      "inc_deg": 12.77,
      "varpi_deg": 301.2,
      "T_N": 2.657,
      "size_label": "141–200 km",
      "size_km": 141.4,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "CAMP2_004",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "CAMP2_005",
      "focusId": "CAMP2_005",
      "label": "CAMP2_005",
      "group": "etno",
      "facility": "Vera C. Rubin LSST (dp2 Hybrid) + ",
      "date": "28.0 d",
      "ra": 311.99881,
      "dec": -27.92575,
      "mag": "22.93 AB",
      "H": 8.05,
      "r_au": 31.0,
      "a_au": 38.98,
      "q_au": 30.07,
      "e": 0.228,
      "inc_deg": 10.06,
      "varpi_deg": 339.6,
      "T_N": 2.954,
      "size_label": "116–163 km",
      "size_km": 115.5,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "CAMP2_005",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "TNO_W1_01",
      "focusId": "TNO_W1_01",
      "label": "TNO_W1_01",
      "group": "etno",
      "facility": "LSST_DP2",
      "date": "32.9 d",
      "ra": 270.06261,
      "dec": -24.23615,
      "mag": "22.06 AB",
      "H": 6.57,
      "r_au": 35.85,
      "a_au": 54.01,
      "q_au": 35.85,
      "e": 0.336,
      "inc_deg": 4.29,
      "varpi_deg": 269.3,
      "T_N": 3.074,
      "size_label": "228–322 km",
      "size_km": 228.0,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "TNO_W1_01",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "TNO_W1_02",
      "focusId": "TNO_W1_02",
      "label": "TNO_W1_02",
      "group": "etno",
      "facility": "LSST_DP2",
      "date": "31.9 d",
      "ra": 283.2992,
      "dec": -20.76871,
      "mag": "22.17 AB",
      "H": 6.54,
      "r_au": 37.06,
      "a_au": 47.74,
      "q_au": 36.36,
      "e": 0.236,
      "inc_deg": 2.78,
      "varpi_deg": 256.5,
      "T_N": 3.076,
      "size_label": "231–327 km",
      "size_km": 231.2,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "TNO_W1_02",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "TNO_W1_04",
      "focusId": "TNO_W1_04",
      "label": "TNO_W1_04",
      "group": "etno",
      "facility": "LSST_DP2",
      "date": "31.9 d",
      "ra": 271.07993,
      "dec": -22.77456,
      "mag": "23.16 AB",
      "H": 7.01,
      "r_au": 41.69,
      "a_au": 76.17,
      "q_au": 31.15,
      "e": 0.148,
      "inc_deg": 3.68,
      "varpi_deg": 205.2,
      "T_N": 3.536,
      "size_label": "186–263 km",
      "size_km": 186.2,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "TNO_W1_04",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "TNO_W1_05",
      "focusId": "TNO_W1_05",
      "label": "TNO_W1_05",
      "group": "etno",
      "facility": "LSST_DP2",
      "date": "40.3 d",
      "ra": 285.53269,
      "dec": -23.49099,
      "mag": "21.52 AB",
      "H": 5.02,
      "r_au": 45.2,
      "a_au": 44.26,
      "q_au": 43.22,
      "e": 0.46,
      "inc_deg": 5.12,
      "varpi_deg": 178.9,
      "T_N": 2.826,
      "size_label": "466–658 km",
      "size_km": 465.6,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "TNO_W1_05",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "TNO_W1_06",
      "focusId": "TNO_W1_06",
      "label": "TNO_W1_06",
      "group": "etno",
      "facility": "LSST_DP2",
      "date": "31.9 d",
      "ra": 280.73976,
      "dec": -20.80234,
      "mag": "22.14 AB",
      "H": 6.33,
      "r_au": 38.57,
      "a_au": 39.49,
      "q_au": 26.58,
      "e": 0.328,
      "inc_deg": 33.82,
      "varpi_deg": 24.5,
      "T_N": 2.56,
      "size_label": "255–360 km",
      "size_km": 254.7,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "TNO_W1_06",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "TNO_W1_07",
      "focusId": "TNO_W1_07",
      "label": "TNO_W1_07",
      "group": "etno",
      "facility": "LSST_DP2",
      "date": "55.7 d",
      "ra": 289.74154,
      "dec": -20.42174,
      "mag": "23.43 AB",
      "H": 8.64,
      "r_au": 30.62,
      "a_au": 39.78,
      "q_au": 28.13,
      "e": 0.294,
      "inc_deg": 14.23,
      "varpi_deg": 337.9,
      "T_N": 2.887,
      "size_label": "88–124 km",
      "size_km": 87.9,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "TNO_W1_07",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "TNO_W1_08",
      "focusId": "TNO_W1_08",
      "label": "TNO_W1_08",
      "group": "etno",
      "facility": "LSST_DP2",
      "date": "26.9 d",
      "ra": 253.30301,
      "dec": -22.70381,
      "mag": "22.92 AB",
      "H": 8.08,
      "r_au": 30.94,
      "a_au": 52.38,
      "q_au": 26.35,
      "e": 0.235,
      "inc_deg": 5.25,
      "varpi_deg": 269.8,
      "T_N": 3.129,
      "size_label": "114–161 km",
      "size_km": 113.8,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "TNO_W1_08",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "TNO_W1_09",
      "focusId": "TNO_W1_09",
      "label": "TNO_W1_09",
      "group": "etno",
      "facility": "LSST_DP2",
      "date": "28.7 d",
      "ra": 289.14267,
      "dec": -25.06627,
      "mag": "22.18 AB",
      "H": 5.81,
      "r_au": 43.88,
      "a_au": 44.99,
      "q_au": 41.24,
      "e": 0.446,
      "inc_deg": 2.81,
      "varpi_deg": 219.5,
      "T_N": 2.855,
      "size_label": "324–458 km",
      "size_km": 323.6,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "TNO_W1_09",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "TNO_W1_10",
      "focusId": "TNO_W1_10",
      "label": "TNO_W1_10",
      "group": "etno",
      "facility": "LSST_DP2",
      "date": "25.9 d",
      "ra": 285.62734,
      "dec": -24.90983,
      "mag": "22.56 AB",
      "H": 6.77,
      "r_au": 38.42,
      "a_au": 45.79,
      "q_au": 34.86,
      "e": 0.221,
      "inc_deg": 4.71,
      "varpi_deg": 349.9,
      "T_N": 3.056,
      "size_label": "208–294 km",
      "size_km": 208.0,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "TNO_W1_10",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "TNO_W1_11",
      "focusId": "TNO_W1_11",
      "label": "TNO_W1_11",
      "group": "etno",
      "facility": "LSST_DP2",
      "date": "31.0 d",
      "ra": 279.0098,
      "dec": -25.5966,
      "mag": "21.08 AB",
      "H": 5.3,
      "r_au": 38.38,
      "a_au": 42.85,
      "q_au": 37.49,
      "e": 0.197,
      "inc_deg": 11.3,
      "varpi_deg": 327.7,
      "T_N": 2.997,
      "size_label": "409–579 km",
      "size_km": 409.2,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "TNO_W1_11",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "TNO_W1_12",
      "focusId": "TNO_W1_12",
      "label": "TNO_W1_12",
      "group": "etno",
      "facility": "LSST_DP2",
      "date": "78.9 d",
      "ra": 288.08476,
      "dec": -19.53773,
      "mag": "23.08 AB",
      "H": 6.37,
      "r_au": 47.35,
      "a_au": 44.36,
      "q_au": 41.37,
      "e": 0.067,
      "inc_deg": 4.27,
      "varpi_deg": 104.0,
      "T_N": 3.095,
      "size_label": "250–354 km",
      "size_km": 250.0,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "TNO_W1_12",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "TNO_W1_13",
      "focusId": "TNO_W1_13",
      "label": "TNO_W1_13",
      "group": "etno",
      "facility": "LSST_DP2",
      "date": "31.7 d",
      "ra": 294.61264,
      "dec": -21.76874,
      "mag": "23.02 AB",
      "H": 7.62,
      "r_au": 35.11,
      "a_au": 40.34,
      "q_au": 33.63,
      "e": 0.156,
      "inc_deg": 7.63,
      "varpi_deg": 325.0,
      "T_N": 3.013,
      "size_label": "141–199 km",
      "size_km": 140.6,
      "note_en": "Audit: I-19-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Eighteen of the nineteen additional multi-survey TNOs are real, uncatalogued objects.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "TNO_W1_13",
      "audit_grade_level": "claim",
      "audit_entries": [
        "I-19-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "EUCLID_DR1_C3_GOLD_01",
      "focusId": "EUCLID_DR1_C3_GOLD_01",
      "label": "EUCLID_DR1_C3_GOLD_01",
      "group": "euclid_gold",
      "facility": "ESA Euclid DR1 (MPC 273)",
      "date": "84.3 h",
      "ra": 149.74351,
      "dec": 2.50469,
      "mag": "23.54 AB",
      "H": 16.07,
      "r_au": 5.23,
      "a_au": 5.23,
      "q_au": 5.21,
      "e": 0.003,
      "inc_deg": 10.87,
      "varpi_deg": 39.5,
      "T_N": 6.569,
      "size_label": "3.1 km",
      "size_km": 3.075,
      "note_en": "Audit (C3_GOLD_01): Euclid VIS rows exist only as a re-export (mpc_ades_grand_unified_14tel.psv); no catalogued match; orbit undetermined.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "C3_GOLD_01",
      "audit_grade_level": "object",
      "audit_entries": [
        "C3_GOLD_01"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_DR1_C3_GOLD_02",
      "focusId": "EUCLID_DR1_C3_GOLD_02",
      "label": "EUCLID_DR1_C3_GOLD_02",
      "group": "stereo_kbo",
      "facility": "ESA Euclid DR1 (MPC 273)",
      "date": "15.56 h",
      "ra": 5.63701,
      "dec": -32.25252,
      "mag": "24.92 AB",
      "H": 8.69,
      "r_au": 43.7,
      "a_au": 56.11,
      "q_au": 43.7,
      "e": 0.221,
      "inc_deg": 41.73,
      "varpi_deg": 359.2,
      "T_N": 2.524,
      "size_label": "86.0 km",
      "size_km": 86.009,
      "note_en": "Audit (C3_GOLD_02): Slow mover with rows only in a re-export; lead ranging supports a trans-Neptunian distance; a/e undetermined; pixel reality untested (C3_02 inconclusive).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "C3_GOLD_02",
      "audit_grade_level": "object",
      "audit_entries": [
        "C3_GOLD_02"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_DR1_C3_GOLD_04",
      "focusId": "EUCLID_DR1_C3_GOLD_04",
      "label": "EUCLID_DR1_C3_GOLD_04",
      "group": "euclid_gold",
      "facility": "ESA Euclid DR1 (MPC 273)",
      "date": "69.83 h",
      "ra": 150.19043,
      "dec": 2.06584,
      "mag": "24.29 AB",
      "H": 16.51,
      "r_au": 5.62,
      "a_au": 5.44,
      "q_au": 5.19,
      "e": 0.046,
      "inc_deg": 9.29,
      "varpi_deg": 279.7,
      "T_N": 6.366,
      "size_label": "2.5 km",
      "size_km": 2.508,
      "note_en": "Audit (C3_GOLD_04): Euclid VIS rows exist only as a re-export (mpc_ades_grand_unified_14tel.psv); no catalogued match; orbit undetermined.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "C3_GOLD_04",
      "audit_grade_level": "object",
      "audit_entries": [
        "C3_GOLD_04"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_DR1_C3_GOLD_05",
      "focusId": "EUCLID_DR1_C3_GOLD_05",
      "label": "EUCLID_DR1_C3_GOLD_05",
      "group": "euclid_gold",
      "facility": "ESA Euclid DR1 (MPC 273)",
      "date": "84.3 h",
      "ra": 149.59775,
      "dec": 2.59097,
      "mag": "24.92 AB",
      "H": 17.18,
      "r_au": 5.58,
      "a_au": 5.08,
      "q_au": 4.55,
      "e": 0.103,
      "inc_deg": 25.07,
      "varpi_deg": 333.0,
      "T_N": 6.66,
      "size_label": "1.8 km",
      "size_km": 1.843,
      "note_en": "Audit (C3_GOLD_05): Euclid VIS rows exist only as a re-export (mpc_ades_grand_unified_14tel.psv); no catalogued match; orbit undetermined.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "C3_GOLD_05",
      "audit_grade_level": "object",
      "audit_entries": [
        "C3_GOLD_05"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_DR1_C3_GOLD_06",
      "focusId": "EUCLID_DR1_C3_GOLD_06",
      "label": "EUCLID_DR1_C3_GOLD_06",
      "group": "euclid_gold",
      "facility": "ESA Euclid DR1 (MPC 273)",
      "date": "84.6 h",
      "ra": 150.06194,
      "dec": 1.92872,
      "mag": "24.73 AB",
      "H": 17.26,
      "r_au": 5.29,
      "a_au": 4.83,
      "q_au": 4.33,
      "e": 0.104,
      "inc_deg": 16.0,
      "varpi_deg": 340.2,
      "T_N": 6.992,
      "size_label": "1.8 km",
      "size_km": 1.775,
      "note_en": "Audit (C3_GOLD_06): Euclid VIS rows exist only as a re-export (mpc_ades_grand_unified_14tel.psv); no catalogued match; orbit undetermined.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "C3_GOLD_06",
      "audit_grade_level": "object",
      "audit_entries": [
        "C3_GOLD_06"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_DR1_C3_GOLD_07",
      "focusId": "EUCLID_DR1_C3_GOLD_07",
      "label": "EUCLID_DR1_C3_GOLD_07",
      "group": "stereo_kbo",
      "facility": "ESA Euclid DR1 (MPC 273)",
      "date": "12.12 h",
      "ra": 5.77298,
      "dec": -32.17565,
      "mag": "24.90 AB",
      "H": 9.3,
      "r_au": 37.77,
      "a_au": 37.77,
      "q_au": 37.77,
      "e": 0.0,
      "inc_deg": 34.58,
      "varpi_deg": 39.4,
      "T_N": 2.642,
      "size_label": "64.8 km",
      "size_km": 64.758,
      "note_en": "Audit (C3_GOLD_07): Slow mover with rows only in a re-export; lead ranging supports a trans-Neptunian distance; a/e undetermined; pixel reality untested (C3_02 inconclusive).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "C3_GOLD_07",
      "audit_grade_level": "object",
      "audit_entries": [
        "C3_GOLD_07"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_DR1_C3_GOLD_09",
      "focusId": "EUCLID_DR1_C3_GOLD_09",
      "label": "EUCLID_DR1_C3_GOLD_09",
      "group": "euclid_gold",
      "facility": "ESA Euclid DR1 (MPC 273)",
      "date": "54.76 h",
      "ra": 149.72006,
      "dec": 2.28183,
      "mag": "24.60 AB",
      "H": 17.05,
      "r_au": 5.4,
      "a_au": 6.5,
      "q_au": 5.35,
      "e": 0.177,
      "inc_deg": 18.62,
      "varpi_deg": 158.8,
      "T_N": 5.493,
      "size_label": "2.0 km",
      "size_km": 1.951,
      "note_en": "Audit (C3_GOLD_09): Euclid VIS rows exist only as a re-export (mpc_ades_grand_unified_14tel.psv); no catalogued match; orbit undetermined.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "C3_GOLD_09",
      "audit_grade_level": "object",
      "audit_entries": [
        "C3_GOLD_09"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_DR1_C3_GOLD_11",
      "focusId": "EUCLID_DR1_C3_GOLD_11",
      "label": "EUCLID_DR1_C3_GOLD_11",
      "group": "stereo_kbo",
      "facility": "ESA Euclid DR1 (MPC 273)",
      "date": "59.98 h",
      "ra": 149.73506,
      "dec": 2.64836,
      "mag": "25.14 AB",
      "H": 8.51,
      "r_au": 48.04,
      "a_au": 46.25,
      "q_au": 44.46,
      "e": 0.039,
      "inc_deg": 21.31,
      "varpi_deg": 329.5,
      "T_N": 2.959,
      "size_label": "93.4 km",
      "size_km": 93.432,
      "note_en": "Audit (C3_GOLD_11): Slow mover with rows only in a re-export; lead ranging supports a trans-Neptunian distance; a/e undetermined; pixel reality untested (C3_02 inconclusive).",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "C3_GOLD_11",
      "audit_grade_level": "object",
      "audit_entries": [
        "C3_GOLD_11"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_DR1_C3_GOLD_13",
      "focusId": "EUCLID_DR1_C3_GOLD_13",
      "label": "EUCLID_DR1_C3_GOLD_13",
      "group": "euclid_gold",
      "facility": "ESA Euclid DR1 (MPC 273)",
      "date": "54.76 h",
      "ra": 150.45641,
      "dec": 1.83113,
      "mag": "24.91 AB",
      "H": 18.09,
      "r_au": 4.52,
      "a_au": 3.75,
      "q_au": 2.85,
      "e": 0.241,
      "inc_deg": 13.41,
      "varpi_deg": 343.2,
      "T_N": 8.685,
      "size_label": "1.2 km",
      "size_km": 1.212,
      "note_en": "Audit (C3_GOLD_13): Euclid VIS rows exist only as a re-export (mpc_ades_grand_unified_14tel.psv); no catalogued match; orbit undetermined.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "C3_GOLD_13",
      "audit_grade_level": "object",
      "audit_entries": [
        "C3_GOLD_13"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_DR1_C3_GOLD_17",
      "focusId": "EUCLID_DR1_C3_GOLD_17",
      "label": "EUCLID_DR1_C3_GOLD_17",
      "group": "euclid_gold",
      "facility": "ESA Euclid DR1 (MPC 273)",
      "date": "15.66 h",
      "ra": 149.96813,
      "dec": 2.64014,
      "mag": "25.04 AB",
      "H": 17.55,
      "r_au": 5.23,
      "a_au": 5.24,
      "q_au": 5.23,
      "e": 0.001,
      "inc_deg": 28.89,
      "varpi_deg": 154.4,
      "T_N": 6.47,
      "size_label": "1.6 km",
      "size_km": 1.555,
      "note_en": "Audit (C3_GOLD_17): Euclid VIS rows exist only as a re-export (mpc_ades_grand_unified_14tel.psv); no catalogued match; orbit undetermined.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "C3_GOLD_17",
      "audit_grade_level": "object",
      "audit_entries": [
        "C3_GOLD_17"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "W4_JUP_MOON_GOLD_001",
      "focusId": "W4_JUP_MOON_GOLD_001",
      "label": "W4_JUP_MOON_GOLD_001",
      "group": "moon_binary",
      "facility": "MPC Stations 269+T09 + Planetocent",
      "date": "59.004 d",
      "ra": 112.3599,
      "dec": 22.1647,
      "mag": "23.50 AB",
      "H": 16.56,
      "r_au": 5.201,
      "a_au": 0.1361,
      "q_au": 0.0848,
      "e": 0.377,
      "inc_deg": 163.2,
      "varpi_deg": 329.3,
      "T_N": null,
      "size_label": "2.3–3.2 km",
      "size_km": 2.4,
      "note_en": "Audit: III-M01-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Bound, uncatalogued Jovian irregular satellite.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "J25-M01",
      "audit_grade_level": "claim",
      "audit_entries": [
        "III-M01-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "W4_JUP_MOON_GOLD_002",
      "focusId": "W4_JUP_MOON_GOLD_002",
      "label": "W4_JUP_MOON_GOLD_002",
      "group": "moon_binary",
      "facility": "MPC Stations 269 + PlanetocentricI",
      "date": "29.901 d",
      "ra": 112.25103,
      "dec": 22.73338,
      "mag": "24.20 AB",
      "H": 17.3,
      "r_au": 5.156,
      "a_au": 0.125,
      "q_au": 0.0711,
      "e": 0.431,
      "inc_deg": 160.33,
      "varpi_deg": 112.0,
      "T_N": null,
      "size_label": "1.6–2.3 km",
      "size_km": 2.4,
      "note_en": "Audit: III-M02-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Bound, uncatalogued Jovian irregular satellite.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "J25-M02",
      "audit_grade_level": "claim",
      "audit_entries": [
        "III-M02-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "W4_JUP_MOON_GOLD_003",
      "focusId": "W4_JUP_MOON_GOLD_003",
      "label": "W4_JUP_MOON_GOLD_003",
      "group": "moon_binary",
      "facility": "MPC Stations 304+568+807 + Planeto",
      "date": "57.738 d",
      "ra": 197.126,
      "dec": -5.47895,
      "mag": "23.90 AB",
      "H": 16.7,
      "r_au": 5.505,
      "a_au": 0.1172,
      "q_au": 0.0838,
      "e": 0.285,
      "inc_deg": 161.93,
      "varpi_deg": 357.8,
      "T_N": null,
      "size_label": "2.1–3.0 km",
      "size_km": 2.4,
      "note_en": "Audit: III-M03-01 [PLAUSIBLE_NEEDS_FOLLOWUP] Bound, uncatalogued Jovian irregular satellite.",
      "audit_status": "AUDITED_SURVIVOR",
      "is_audited_survivor": true,
      "is_recovery_control": false,
      "audit_verdict": "PLAUSIBLE_NEEDS_FOLLOWUP",
      "audit_id": "J25-M03",
      "audit_grade_level": "claim",
      "audit_entries": [
        "III-M03-01"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "EUCLID_DR1_C3_GOLD_15",
      "focusId": "EUCLID_DR1_C3_GOLD_15",
      "label": "C3_GOLD_15",
      "group": "stereo_kbo",
      "facility": "ESA Euclid DR1 (MPC 273)",
      "date": "30.43 h",
      "ra": 150.51491,
      "dec": 1.49013,
      "mag": "24.62 AB",
      "H": 10.39,
      "r_au": 27.02,
      "a_au": 27.02,
      "q_au": 27.02,
      "e": 0.0,
      "inc_deg": 10.13,
      "varpi_deg": 335.1,
      "T_N": 2.979,
      "size_label": "39.3 km",
      "size_km": 39.296,
      "note_en": "Audit (C3_GOLD_15): Slow mover with rows only in a re-export; not a TNO by its own tabulated elements (a<30 au, JSON label 'Centaur'); distance 21-30 au.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "C3_GOLD_15",
      "audit_grade_level": "object",
      "audit_entries": [
        "C3_GOLD_15"
      ],
      "known_designation": null,
      "orbit_audit": "DISPUTED_OR_OVERCLAIMED"
    },
    {
      "id": "EUCLID_DR1_C3_GOLD_16",
      "focusId": "EUCLID_DR1_C3_GOLD_16",
      "label": "C3_GOLD_16",
      "group": "stereo_kbo",
      "facility": "ESA Euclid DR1 (MPC 273)",
      "date": "8.38 h",
      "ra": 5.47499,
      "dec": -31.71696,
      "mag": "25.20 AB",
      "H": 12.22,
      "r_au": 19.93,
      "a_au": 19.93,
      "q_au": 19.93,
      "e": 0.0,
      "inc_deg": 68.76,
      "varpi_deg": 10.3,
      "T_N": 2.099,
      "size_label": "16.9 km",
      "size_km": 16.886,
      "note_en": "Audit (C3_GOLD_16): Slow mover with rows only in a re-export; not a TNO by its own tabulated elements (a<30 au, JSON label 'Centaur'); distance unconstrained (5-40 au) from 8.4 h, e=0 and i=68.8 deg are an arbitrary circular root.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "C3_GOLD_16",
      "audit_grade_level": "object",
      "audit_entries": [
        "C3_GOLD_16"
      ],
      "known_designation": null,
      "orbit_audit": "INVALID_OR_UNSUPPORTED"
    },
    {
      "id": "SAT3_NEW_04",
      "focusId": "SAT3_NEW_04",
      "label": "SAT3_NEW_04",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "7.9 d",
      "ra": 346.74862,
      "dec": -8.73183,
      "mag": "22.47 AB",
      "H": 18.96,
      "r_au": 2.801,
      "a_au": 3.18,
      "q_au": 2.77,
      "e": 0.13,
      "inc_deg": 8.96,
      "varpi_deg": 181.7,
      "T_N": 10.081,
      "size_label": "0.57 km",
      "size_km": 0.57,
      "note_en": "Audit (SAT3_NEW_04): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_04",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_04"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_13",
      "focusId": "SAT3_NEW_13",
      "label": "SAT3_NEW_13",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "46.1 d",
      "ra": 341.87945,
      "dec": -10.46298,
      "mag": "22.19 AB",
      "H": 20.3,
      "r_au": 2.126,
      "a_au": 2.33,
      "q_au": 2.06,
      "e": 0.119,
      "inc_deg": 5.19,
      "varpi_deg": 176.9,
      "T_N": 13.429,
      "size_label": "0.31 km",
      "size_km": 0.31,
      "note_en": "Audit (SAT3_NEW_13): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_13",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_13"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_15",
      "focusId": "SAT3_NEW_15",
      "label": "SAT3_NEW_15",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "16.0 d",
      "ra": 342.69335,
      "dec": -11.41945,
      "mag": "22.51 AB",
      "H": 19.21,
      "r_au": 2.694,
      "a_au": 2.65,
      "q_au": 2.61,
      "e": 0.016,
      "inc_deg": 2.63,
      "varpi_deg": 177.7,
      "T_N": 11.928,
      "size_label": "0.51 km",
      "size_km": 0.51,
      "note_en": "Audit (SAT3_NEW_15): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_15",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_15"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_20",
      "focusId": "SAT3_NEW_20",
      "label": "SAT3_NEW_20",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "15.9 d",
      "ra": 329.42101,
      "dec": -16.87767,
      "mag": "21.97 AB",
      "H": 19.0,
      "r_au": 2.544,
      "a_au": 3.07,
      "q_au": 2.53,
      "e": 0.177,
      "inc_deg": 6.23,
      "varpi_deg": 164.4,
      "T_N": 10.423,
      "size_label": "0.56 km",
      "size_km": 0.56,
      "note_en": "Audit (SAT3_NEW_20): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_20",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_20"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_24",
      "focusId": "SAT3_NEW_24",
      "label": "SAT3_NEW_24",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "28.0 d",
      "ra": 317.41647,
      "dec": -15.92199,
      "mag": "21.62 AB",
      "H": 17.9,
      "r_au": 2.908,
      "a_au": 3.1,
      "q_au": 2.87,
      "e": 0.075,
      "inc_deg": 8.87,
      "varpi_deg": 152.4,
      "T_N": 10.336,
      "size_label": "0.93 km",
      "size_km": 0.93,
      "note_en": "Audit (SAT3_NEW_24): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_24",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_24"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_31",
      "focusId": "SAT3_NEW_31",
      "label": "SAT3_NEW_31",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "75.0 d",
      "ra": 343.04456,
      "dec": -5.24704,
      "mag": "22.20 AB",
      "H": 18.97,
      "r_au": 2.662,
      "a_au": 2.66,
      "q_au": 2.56,
      "e": 0.036,
      "inc_deg": 7.21,
      "varpi_deg": 178.0,
      "T_N": 11.903,
      "size_label": "0.57 km",
      "size_km": 0.57,
      "note_en": "Audit (SAT3_NEW_31): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_31",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_31"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_35",
      "focusId": "SAT3_NEW_35",
      "label": "SAT3_NEW_35",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "15.0 d",
      "ra": 327.32045,
      "dec": -8.94162,
      "mag": "22.56 AB",
      "H": 19.23,
      "r_au": 2.709,
      "a_au": 2.74,
      "q_au": 2.49,
      "e": 0.091,
      "inc_deg": 6.29,
      "varpi_deg": 162.3,
      "T_N": 11.58,
      "size_label": "0.51 km",
      "size_km": 0.51,
      "note_en": "Audit (SAT3_NEW_35): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_35",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_35"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_38",
      "focusId": "SAT3_NEW_38",
      "label": "SAT3_NEW_38",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "23.9 d",
      "ra": 318.30036,
      "dec": -16.81423,
      "mag": "22.74 AB",
      "H": 20.12,
      "r_au": 2.394,
      "a_au": 2.33,
      "q_au": 1.27,
      "e": 0.456,
      "inc_deg": 1.16,
      "varpi_deg": 153.3,
      "T_N": 13.395,
      "size_label": "0.34 km",
      "size_km": 0.34,
      "note_en": "Audit (SAT3_NEW_38): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_38",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_38"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_40",
      "focusId": "SAT3_NEW_40",
      "label": "SAT3_NEW_40",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "57.1 d",
      "ra": 337.16138,
      "dec": -1.42825,
      "mag": "22.51 AB",
      "H": 18.89,
      "r_au": 2.855,
      "a_au": 3.06,
      "q_au": 2.85,
      "e": 0.067,
      "inc_deg": 11.7,
      "varpi_deg": 172.2,
      "T_N": 10.447,
      "size_label": "0.59 km",
      "size_km": 0.59,
      "note_en": "Audit (SAT3_NEW_40): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_40",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_40"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_41",
      "focusId": "SAT3_NEW_41",
      "label": "SAT3_NEW_41",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "22.0 d",
      "ra": 336.12438,
      "dec": -0.69635,
      "mag": "22.13 AB",
      "H": 18.82,
      "r_au": 2.699,
      "a_au": 3.16,
      "q_au": 2.49,
      "e": 0.212,
      "inc_deg": 15.74,
      "varpi_deg": 171.1,
      "T_N": 10.123,
      "size_label": "0.61 km",
      "size_km": 0.61,
      "note_en": "Audit (SAT3_NEW_41): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_41",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_41"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_47",
      "focusId": "SAT3_NEW_47",
      "label": "SAT3_NEW_47",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "40.0 d",
      "ra": 316.89715,
      "dec": -13.10013,
      "mag": "22.11 AB",
      "H": 19.94,
      "r_au": 2.224,
      "a_au": 2.74,
      "q_au": 2.22,
      "e": 0.19,
      "inc_deg": 3.06,
      "varpi_deg": 151.9,
      "T_N": 11.555,
      "size_label": "0.37 km",
      "size_km": 0.37,
      "note_en": "Audit (SAT3_NEW_47): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_47",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_47"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_51",
      "focusId": "SAT3_NEW_51",
      "label": "SAT3_NEW_51",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "17.0 d",
      "ra": 339.30176,
      "dec": 0.93371,
      "mag": "22.82 AB",
      "H": 18.35,
      "r_au": 3.344,
      "a_au": 3.06,
      "q_au": 2.69,
      "e": 0.122,
      "inc_deg": 22.26,
      "varpi_deg": 174.3,
      "T_N": 10.403,
      "size_label": "0.76 km",
      "size_km": 0.76,
      "note_en": "Audit (SAT3_NEW_51): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_51",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_51"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_53",
      "focusId": "SAT3_NEW_53",
      "label": "SAT3_NEW_53",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "7.9 d",
      "ra": 337.12652,
      "dec": -3.43784,
      "mag": "22.89 AB",
      "H": 19.1,
      "r_au": 2.943,
      "a_au": 2.76,
      "q_au": 2.57,
      "e": 0.07,
      "inc_deg": 8.64,
      "varpi_deg": 172.1,
      "T_N": 11.481,
      "size_label": "0.54 km",
      "size_km": 0.54,
      "note_en": "Audit (SAT3_NEW_53): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_53",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_53"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_54",
      "focusId": "SAT3_NEW_54",
      "label": "SAT3_NEW_54",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "22.9 d",
      "ra": 337.02193,
      "dec": -3.37259,
      "mag": "23.10 AB",
      "H": 20.63,
      "r_au": 2.336,
      "a_au": 2.59,
      "q_au": 2.13,
      "e": 0.178,
      "inc_deg": 14.55,
      "varpi_deg": 172.0,
      "T_N": 12.182,
      "size_label": "0.27 km",
      "size_km": 0.27,
      "note_en": "Audit (SAT3_NEW_54): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_54",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_54"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_55",
      "focusId": "SAT3_NEW_55",
      "label": "SAT3_NEW_55",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "7.9 d",
      "ra": 336.3713,
      "dec": -3.81276,
      "mag": "22.55 AB",
      "H": 19.68,
      "r_au": 2.501,
      "a_au": 2.86,
      "q_au": 2.5,
      "e": 0.126,
      "inc_deg": 8.76,
      "varpi_deg": 171.4,
      "T_N": 11.115,
      "size_label": "0.41 km",
      "size_km": 0.41,
      "note_en": "Audit (SAT3_NEW_55): Unidentified Rubin-only candidate presented as a 'three-satellite Euclid+SPHEREx' spaceborne discovery.",
      "audit_status": "DISPUTED_CLAIM",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_55",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_55"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "EUCLID_EES149_GOLD_18",
      "focusId": "EUCLID_EES149_GOLD_18",
      "label": "2019 UM31 (EUC-G18 control)",
      "group": "euclid_gold",
      "facility": "Euclid 273 (VIS+NISP)",
      "date": "2023-12 (23.5 h, 26 ep)",
      "ra": 9.80588,
      "dec": 5.10499,
      "mag": "22.91 I_E",
      "H": 19.3,
      "r_au": 1.851,
      "a_au": 2.597,
      "q_au": 1.779,
      "e": 0.315,
      "inc_deg": 7.05,
      "varpi_deg": null,
      "T_N": null,
      "size_label": "Main-belt asteroid",
      "size_km": null,
      "note_en": "Catalogued main-belt asteroid 2019 UM31; kept as a recovery control. Elements are the published ones (a = 2.597 au, e = 0.315, i = 7.05 deg), not the withdrawn short-arc fit.",
      "audit_status": "RECOVERY_CONTROL",
      "is_audited_survivor": false,
      "is_recovery_control": true,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "EUC-G18",
      "audit_grade_level": "object",
      "audit_entries": [
        "EUC-G18"
      ],
      "known_designation": "2019 UM31",
      "orbit_audit": null
    },
    {
      "id": "QB98_2021",
      "focusId": "QB98_2021",
      "label": "2021 QB98 (recovery control)",
      "group": "etno",
      "facility": "Vera C. Rubin LSST (dp2) + CTIO (8",
      "date": "14 observations over 4",
      "ra": null,
      "dec": null,
      "mag": "23.68 AB",
      "H": 5.75,
      "r_au": 62.653,
      "a_au": null,
      "q_au": null,
      "e": null,
      "inc_deg": null,
      "varpi_deg": null,
      "T_N": null,
      "size_label": "—",
      "size_km": null,
      "note_en": "Catalogued object 2021 QB98, recovered in this search and kept as a recovery control. It is not a new discovery; its fitted elements are not tabulated here.",
      "audit_status": "RECOVERY_CONTROL",
      "is_audited_survivor": false,
      "is_recovery_control": true,
      "audit_verdict": null,
      "audit_id": null,
      "audit_grade_level": null,
      "audit_entries": [],
      "known_designation": "2021 QB98",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_01",
      "focusId": "SAT3_NEW_01",
      "label": "2015 RP29",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "14.8 d",
      "ra": 222.43145,
      "dec": -39.63381,
      "mag": "21.43 AB",
      "H": 17.48,
      "r_au": 3.033,
      "a_au": 3.14,
      "q_au": 2.48,
      "e": 0.212,
      "inc_deg": 17.81,
      "varpi_deg": 57.4,
      "T_N": 10.169,
      "size_label": "1.13 km",
      "size_km": 1.13,
      "note_en": "Catalogued 2015 RP29, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_01",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_01"
      ],
      "known_designation": "2015 RP29",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_02",
      "focusId": "SAT3_NEW_02",
      "label": "2025 KH35",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "5.0 d",
      "ra": 223.52692,
      "dec": -38.58353,
      "mag": "21.60 AB",
      "H": 17.68,
      "r_au": 3.017,
      "a_au": 3.07,
      "q_au": 2.98,
      "e": 0.03,
      "inc_deg": 14.41,
      "varpi_deg": 58.5,
      "T_N": 10.404,
      "size_label": "1.03 km",
      "size_km": 1.03,
      "note_en": "Catalogued 2025 KH35, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_02",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_02"
      ],
      "known_designation": "2025 KH35",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_03",
      "focusId": "SAT3_NEW_03",
      "label": "2025 CO19",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "14.0 d",
      "ra": 150.34394,
      "dec": 2.52962,
      "mag": "22.47 AB",
      "H": 15.82,
      "r_au": 5.155,
      "a_au": 5.18,
      "q_au": 5.15,
      "e": 0.005,
      "inc_deg": 10.29,
      "varpi_deg": 345.3,
      "T_N": 6.623,
      "size_label": "2.43 km",
      "size_km": 2.43,
      "note_en": "Catalogued 2025 CO19, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_03",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_03"
      ],
      "known_designation": "2025 CO19",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_05",
      "focusId": "SAT3_NEW_05",
      "label": "2026 ET58",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "14.0 d",
      "ra": 150.71816,
      "dec": 2.8357,
      "mag": "23.32 AB",
      "H": 17.15,
      "r_au": 4.668,
      "a_au": 5.21,
      "q_au": 4.63,
      "e": 0.112,
      "inc_deg": 11.8,
      "varpi_deg": 345.7,
      "T_N": 6.577,
      "size_label": "1.32 km",
      "size_km": 1.32,
      "note_en": "Catalogued 2026 ET58, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_05",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_05"
      ],
      "known_designation": "2026 ET58",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_06",
      "focusId": "SAT3_NEW_06",
      "label": "2025 KK32",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "8.0 d",
      "ra": 224.76527,
      "dec": -36.79704,
      "mag": "21.70 AB",
      "H": 18.71,
      "r_au": 2.554,
      "a_au": 3.09,
      "q_au": 2.5,
      "e": 0.192,
      "inc_deg": 12.87,
      "varpi_deg": 59.8,
      "T_N": 10.342,
      "size_label": "0.64 km",
      "size_km": 0.64,
      "note_en": "Catalogued 2025 KK32, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_06",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_06"
      ],
      "known_designation": "2025 KK32",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_07",
      "focusId": "SAT3_NEW_07",
      "label": "2025 KN32",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "6.9 d",
      "ra": 224.48771,
      "dec": -37.28447,
      "mag": "22.46 AB",
      "H": 20.31,
      "r_au": 2.213,
      "a_au": 2.78,
      "q_au": 2.21,
      "e": 0.205,
      "inc_deg": 12.91,
      "varpi_deg": 59.5,
      "T_N": 11.412,
      "size_label": "0.31 km",
      "size_km": 0.31,
      "note_en": "Catalogued 2025 KN32, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_07",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_07"
      ],
      "known_designation": "2025 KN32",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_08",
      "focusId": "SAT3_NEW_08",
      "label": "2025 MV368",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "8.8 d",
      "ra": 225.11174,
      "dec": -36.62672,
      "mag": "21.40 AB",
      "H": 19.81,
      "r_au": 2.027,
      "a_au": 2.59,
      "q_au": 1.88,
      "e": 0.275,
      "inc_deg": 12.31,
      "varpi_deg": 60.1,
      "T_N": 12.161,
      "size_label": "0.39 km",
      "size_km": 0.39,
      "note_en": "Catalogued 2025 MV368, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_08",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_08"
      ],
      "known_designation": "2025 MV368",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_09",
      "focusId": "SAT3_NEW_09",
      "label": "2025 NG332",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "4.9 d",
      "ra": 322.1628,
      "dec": -10.75152,
      "mag": "22.05 AB",
      "H": 18.3,
      "r_au": 2.923,
      "a_au": 3.17,
      "q_au": 2.92,
      "e": 0.08,
      "inc_deg": 9.7,
      "varpi_deg": 157.2,
      "T_N": 10.115,
      "size_label": "0.78 km",
      "size_km": 0.78,
      "note_en": "Catalogued 2025 NG332, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_09",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_09"
      ],
      "known_designation": "2025 NG332",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_10",
      "focusId": "SAT3_NEW_10",
      "label": "2025 OF383",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "24.1 d",
      "ra": 320.86011,
      "dec": -13.10431,
      "mag": "22.20 AB",
      "H": 18.3,
      "r_au": 3.003,
      "a_au": 2.85,
      "q_au": 2.7,
      "e": 0.054,
      "inc_deg": 13.04,
      "varpi_deg": 155.9,
      "T_N": 11.146,
      "size_label": "0.78 km",
      "size_km": 0.78,
      "note_en": "Catalogued 2025 OF383, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_10",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_10"
      ],
      "known_designation": "2025 OF383",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_11",
      "focusId": "SAT3_NEW_11",
      "label": "2025 KG33",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "7.0 d",
      "ra": 288.96045,
      "dec": -20.58482,
      "mag": "21.76 AB",
      "H": 20.35,
      "r_au": 1.972,
      "a_au": 2.45,
      "q_au": 1.97,
      "e": 0.199,
      "inc_deg": 0.92,
      "varpi_deg": 124.0,
      "T_N": 12.813,
      "size_label": "0.30 km",
      "size_km": 0.3,
      "note_en": "Catalogued 2025 KG33, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_11",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_11"
      ],
      "known_designation": "2025 KG33",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_12",
      "focusId": "SAT3_NEW_12",
      "label": "2014 NR85",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "6.8 d",
      "ra": 288.45511,
      "dec": -21.56645,
      "mag": "20.70 AB",
      "H": 17.64,
      "r_au": 2.585,
      "a_au": 3.2,
      "q_au": 2.25,
      "e": 0.297,
      "inc_deg": 11.92,
      "varpi_deg": 123.5,
      "T_N": 10.018,
      "size_label": "1.05 km",
      "size_km": 1.05,
      "note_en": "Catalogued 2014 NR85, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_12",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_12"
      ],
      "known_designation": "2014 NR85",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_14",
      "focusId": "SAT3_NEW_14",
      "label": "2016 GB323",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "44.1 d",
      "ra": 343.30749,
      "dec": -10.58052,
      "mag": "21.84 AB",
      "H": 19.46,
      "r_au": 2.299,
      "a_au": 2.58,
      "q_au": 1.98,
      "e": 0.231,
      "inc_deg": 12.01,
      "varpi_deg": 178.3,
      "T_N": 12.226,
      "size_label": "0.46 km",
      "size_km": 0.46,
      "note_en": "Catalogued 2016 GB323, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_14",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_14"
      ],
      "known_designation": "2016 GB323",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_16",
      "focusId": "SAT3_NEW_16",
      "label": "2025 PJ276",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "4.0 d",
      "ra": 333.04034,
      "dec": -11.3272,
      "mag": "21.87 AB",
      "H": 18.77,
      "r_au": 2.6,
      "a_au": 3.14,
      "q_au": 2.6,
      "e": 0.172,
      "inc_deg": 0.3,
      "varpi_deg": 168.0,
      "T_N": 10.222,
      "size_label": "0.63 km",
      "size_km": 0.63,
      "note_en": "Catalogued 2025 PJ276, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_16",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_16"
      ],
      "known_designation": "2025 PJ276",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_17",
      "focusId": "SAT3_NEW_17",
      "label": "2025 WQ44",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "3.9 d",
      "ra": 52.74043,
      "dec": -27.43588,
      "mag": "21.60 AB",
      "H": 19.14,
      "r_au": 2.33,
      "a_au": 2.63,
      "q_au": 2.07,
      "e": 0.214,
      "inc_deg": 34.61,
      "varpi_deg": 247.7,
      "T_N": 11.888,
      "size_label": "0.53 km",
      "size_km": 0.53,
      "note_en": "Catalogued 2025 WQ44, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_17",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_17"
      ],
      "known_designation": "2025 WQ44",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_18",
      "focusId": "SAT3_NEW_18",
      "label": "2025 OL570",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "33.0 d",
      "ra": 321.95975,
      "dec": -11.04304,
      "mag": "22.33 AB",
      "H": 17.91,
      "r_au": 3.309,
      "a_au": 3.17,
      "q_au": 3.02,
      "e": 0.045,
      "inc_deg": 8.09,
      "varpi_deg": 157.0,
      "T_N": 10.14,
      "size_label": "0.93 km",
      "size_km": 0.93,
      "note_en": "Catalogued 2025 OL570, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_18",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_18"
      ],
      "known_designation": "2025 OL570",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_19",
      "focusId": "SAT3_NEW_19",
      "label": "2025 OU459",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "27.2 d",
      "ra": 328.01751,
      "dec": -17.04439,
      "mag": "21.84 AB",
      "H": 17.84,
      "r_au": 3.062,
      "a_au": 3.93,
      "q_au": 3.02,
      "e": 0.231,
      "inc_deg": 2.9,
      "varpi_deg": 163.0,
      "T_N": 8.348,
      "size_label": "0.96 km",
      "size_km": 0.96,
      "note_en": "Catalogued 2025 OU459, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_19",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_19"
      ],
      "known_designation": "2025 OU459",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_21",
      "focusId": "SAT3_NEW_21",
      "label": "2017 SD158",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "7.0 d",
      "ra": 290.46605,
      "dec": -20.6445,
      "mag": "21.90 AB",
      "H": 18.97,
      "r_au": 2.527,
      "a_au": 2.67,
      "q_au": 2.32,
      "e": 0.13,
      "inc_deg": 6.58,
      "varpi_deg": 125.5,
      "T_N": 11.87,
      "size_label": "0.57 km",
      "size_km": 0.57,
      "note_en": "Catalogued 2017 SD158, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_21",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_21"
      ],
      "known_designation": "2017 SD158",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_22",
      "focusId": "SAT3_NEW_22",
      "label": "2014 OF436",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "7.0 d",
      "ra": 290.32755,
      "dec": -20.38594,
      "mag": "21.69 AB",
      "H": 19.62,
      "r_au": 2.187,
      "a_au": 2.41,
      "q_au": 1.91,
      "e": 0.21,
      "inc_deg": 4.64,
      "varpi_deg": 125.3,
      "T_N": 13.019,
      "size_label": "0.42 km",
      "size_km": 0.42,
      "note_en": "Catalogued 2014 OF436, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_22",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_22"
      ],
      "known_designation": "2014 OF436",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_23",
      "focusId": "SAT3_NEW_23",
      "label": "2016 EG214",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "7.0 d",
      "ra": 290.71674,
      "dec": -20.23527,
      "mag": "21.91 AB",
      "H": 19.67,
      "r_au": 2.247,
      "a_au": 2.63,
      "q_au": 2.22,
      "e": 0.156,
      "inc_deg": 1.18,
      "varpi_deg": 125.7,
      "T_N": 12.022,
      "size_label": "0.41 km",
      "size_km": 0.41,
      "note_en": "Catalogued 2016 EG214, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_23",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_23"
      ],
      "known_designation": "2016 EG214",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_25",
      "focusId": "SAT3_NEW_25",
      "label": "2020 HQ103",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "7.0 d",
      "ra": 290.97285,
      "dec": -18.60754,
      "mag": "22.14 AB",
      "H": 19.14,
      "r_au": 2.558,
      "a_au": 2.77,
      "q_au": 2.4,
      "e": 0.136,
      "inc_deg": 17.32,
      "varpi_deg": 126.0,
      "T_N": 11.422,
      "size_label": "0.53 km",
      "size_km": 0.53,
      "note_en": "Catalogued 2020 HQ103, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_25",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_25"
      ],
      "known_designation": "2020 HQ103",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_26",
      "focusId": "SAT3_NEW_26",
      "label": "2025 KQ37",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "7.0 d",
      "ra": 290.75045,
      "dec": -19.06904,
      "mag": "21.92 AB",
      "H": 18.53,
      "r_au": 2.738,
      "a_au": 2.98,
      "q_au": 2.68,
      "e": 0.103,
      "inc_deg": 3.73,
      "varpi_deg": 125.8,
      "T_N": 10.702,
      "size_label": "0.70 km",
      "size_km": 0.7,
      "note_en": "Catalogued 2025 KQ37, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_26",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_26"
      ],
      "known_designation": "2025 KQ37",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_27",
      "focusId": "SAT3_NEW_27",
      "label": "2025 NP208",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "5.7 d",
      "ra": 290.92883,
      "dec": -18.36201,
      "mag": "19.90 AB",
      "H": 17.97,
      "r_au": 2.138,
      "a_au": 2.53,
      "q_au": 2.08,
      "e": 0.178,
      "inc_deg": 2.11,
      "varpi_deg": 125.9,
      "T_N": 12.451,
      "size_label": "0.90 km",
      "size_km": 0.9,
      "note_en": "Catalogued 2025 NP208, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_27",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_27"
      ],
      "known_designation": "2025 NP208",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_28",
      "focusId": "SAT3_NEW_28",
      "label": "2014 SM11",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "5.2 d",
      "ra": 290.60739,
      "dec": -19.83856,
      "mag": "21.39 AB",
      "H": 19.53,
      "r_au": 2.114,
      "a_au": 2.42,
      "q_au": 1.95,
      "e": 0.195,
      "inc_deg": 1.23,
      "varpi_deg": 125.6,
      "T_N": 12.957,
      "size_label": "0.44 km",
      "size_km": 0.44,
      "note_en": "Catalogued 2014 SM11, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_28",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_28"
      ],
      "known_designation": "2014 SM11",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_29",
      "focusId": "SAT3_NEW_29",
      "label": "2021 OJ20",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "6.0 d",
      "ra": 291.13244,
      "dec": -18.87721,
      "mag": "21.69 AB",
      "H": 19.14,
      "r_au": 2.365,
      "a_au": 2.69,
      "q_au": 2.28,
      "e": 0.154,
      "inc_deg": 5.51,
      "varpi_deg": 126.1,
      "T_N": 11.759,
      "size_label": "0.53 km",
      "size_km": 0.53,
      "note_en": "Catalogued 2021 OJ20, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_29",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_29"
      ],
      "known_designation": "2021 OJ20",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_30",
      "focusId": "SAT3_NEW_30",
      "label": "2025 OV363",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "73.0 d",
      "ra": 321.64419,
      "dec": -16.28006,
      "mag": "22.07 AB",
      "H": 19.36,
      "r_au": 2.434,
      "a_au": 2.54,
      "q_au": 2.4,
      "e": 0.058,
      "inc_deg": 7.15,
      "varpi_deg": 156.6,
      "T_N": 12.396,
      "size_label": "0.48 km",
      "size_km": 0.48,
      "note_en": "Catalogued 2025 OV363, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_30",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_30"
      ],
      "known_designation": "2025 OV363",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_32",
      "focusId": "SAT3_NEW_32",
      "label": "2025 QF201",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "20.9 d",
      "ra": 342.18229,
      "dec": -4.37304,
      "mag": "22.96 AB",
      "H": 18.32,
      "r_au": 3.455,
      "a_au": 3.97,
      "q_au": 3.42,
      "e": 0.139,
      "inc_deg": 2.5,
      "varpi_deg": 177.2,
      "T_N": 8.295,
      "size_label": "0.77 km",
      "size_km": 0.77,
      "note_en": "Catalogued 2025 QF201, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "DISPUTED_OR_OVERCLAIMED",
      "audit_id": "SAT3_NEW_32",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_32"
      ],
      "known_designation": "2025 QF201",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_33",
      "focusId": "SAT3_NEW_33",
      "label": "2025 OZ618",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "36.1 d",
      "ra": 318.33398,
      "dec": -15.27586,
      "mag": "22.42 AB",
      "H": 18.59,
      "r_au": 2.965,
      "a_au": 3.03,
      "q_au": 2.88,
      "e": 0.049,
      "inc_deg": 12.36,
      "varpi_deg": 153.3,
      "T_N": 10.553,
      "size_label": "0.68 km",
      "size_km": 0.68,
      "note_en": "Catalogued 2025 OZ618, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_33",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_33"
      ],
      "known_designation": "2025 OZ618",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_34",
      "focusId": "SAT3_NEW_34",
      "label": "2025 OP555",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "10.0 d",
      "ra": 318.51532,
      "dec": -14.38424,
      "mag": "22.24 AB",
      "H": 21.04,
      "r_au": 1.909,
      "a_au": 2.35,
      "q_au": 1.91,
      "e": 0.189,
      "inc_deg": 1.89,
      "varpi_deg": 153.5,
      "T_N": 13.329,
      "size_label": "0.22 km",
      "size_km": 0.22,
      "note_en": "Catalogued 2025 OP555, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_34",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_34"
      ],
      "known_designation": "2025 OP555",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_36",
      "focusId": "SAT3_NEW_36",
      "label": "2025 PL274",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "15.0 d",
      "ra": 326.78845,
      "dec": -9.06179,
      "mag": "22.07 AB",
      "H": 17.95,
      "r_au": 3.13,
      "a_au": 3.14,
      "q_au": 3.02,
      "e": 0.037,
      "inc_deg": 9.44,
      "varpi_deg": 161.8,
      "T_N": 10.216,
      "size_label": "0.91 km",
      "size_km": 0.91,
      "note_en": "Catalogued 2025 PL274, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_36",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_36"
      ],
      "known_designation": "2025 PL274",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_37",
      "focusId": "SAT3_NEW_37",
      "label": "2016 DZ43",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "6.2 d",
      "ra": 317.03737,
      "dec": -17.542,
      "mag": "21.73 AB",
      "H": 19.29,
      "r_au": 2.324,
      "a_au": 2.54,
      "q_au": 2.14,
      "e": 0.158,
      "inc_deg": 4.63,
      "varpi_deg": 152.0,
      "T_N": 12.402,
      "size_label": "0.49 km",
      "size_km": 0.49,
      "note_en": "Catalogued 2016 DZ43, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_37",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_37"
      ],
      "known_designation": "2016 DZ43",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_39",
      "focusId": "SAT3_NEW_39",
      "label": "2025 PU178",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "91.9 d",
      "ra": 330.00247,
      "dec": -14.86538,
      "mag": "22.20 AB",
      "H": 18.62,
      "r_au": 2.835,
      "a_au": 3.13,
      "q_au": 2.53,
      "e": 0.19,
      "inc_deg": 2.05,
      "varpi_deg": 165.0,
      "T_N": 10.246,
      "size_label": "0.67 km",
      "size_km": 0.67,
      "note_en": "Catalogued 2025 PU178, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_39",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_39"
      ],
      "known_designation": "2025 PU178",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_42",
      "focusId": "SAT3_NEW_42",
      "label": "2025 ON705",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "13.9 d",
      "ra": 323.30388,
      "dec": -12.55004,
      "mag": "22.49 AB",
      "H": 18.78,
      "r_au": 2.902,
      "a_au": 2.86,
      "q_au": 2.82,
      "e": 0.015,
      "inc_deg": 1.26,
      "varpi_deg": 158.3,
      "T_N": 11.127,
      "size_label": "0.62 km",
      "size_km": 0.62,
      "note_en": "Catalogued 2025 ON705, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_42",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_42"
      ],
      "known_designation": "2025 ON705",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_43",
      "focusId": "SAT3_NEW_43",
      "label": "2025 KV35",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "7.0 d",
      "ra": 288.97303,
      "dec": -19.34828,
      "mag": "21.78 AB",
      "H": 17.41,
      "r_au": 3.281,
      "a_au": 3.46,
      "q_au": 3.22,
      "e": 0.07,
      "inc_deg": 15.82,
      "varpi_deg": 124.0,
      "T_N": 9.339,
      "size_label": "1.17 km",
      "size_km": 1.17,
      "note_en": "Catalogued 2025 KV35, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_43",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_43"
      ],
      "known_designation": "2025 KV35",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_44",
      "focusId": "SAT3_NEW_44",
      "label": "2019 KW50",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "8.2 d",
      "ra": 289.2079,
      "dec": -18.69056,
      "mag": "20.40 AB",
      "H": 17.46,
      "r_au": 2.532,
      "a_au": 3.14,
      "q_au": 2.53,
      "e": 0.194,
      "inc_deg": 18.05,
      "varpi_deg": 124.2,
      "T_N": 10.185,
      "size_label": "1.14 km",
      "size_km": 1.14,
      "note_en": "Catalogued 2019 KW50, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_44",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_44"
      ],
      "known_designation": "2019 KW50",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_45",
      "focusId": "SAT3_NEW_45",
      "label": "2020 PA67",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "4.1 d",
      "ra": 288.56953,
      "dec": -18.94232,
      "mag": "20.99 AB",
      "H": 18.13,
      "r_au": 2.496,
      "a_au": 3.1,
      "q_au": 2.48,
      "e": 0.198,
      "inc_deg": 4.32,
      "varpi_deg": 123.6,
      "T_N": 10.334,
      "size_label": "0.84 km",
      "size_km": 0.84,
      "note_en": "Catalogued 2020 PA67, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_45",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_45"
      ],
      "known_designation": "2020 PA67",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_46",
      "focusId": "SAT3_NEW_46",
      "label": "2020 UH50",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "8.0 d",
      "ra": 348.6952,
      "dec": -15.20449,
      "mag": "23.02 AB",
      "H": 19.03,
      "r_au": 3.053,
      "a_au": 3.16,
      "q_au": 2.86,
      "e": 0.094,
      "inc_deg": 13.19,
      "varpi_deg": 183.7,
      "T_N": 10.15,
      "size_label": "0.56 km",
      "size_km": 0.56,
      "note_en": "Catalogued 2020 UH50, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_46",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_46"
      ],
      "known_designation": "2020 UH50",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_48",
      "focusId": "SAT3_NEW_48",
      "label": "2025 OM380",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "43.9 d",
      "ra": 317.28865,
      "dec": -12.33078,
      "mag": "21.91 AB",
      "H": 20.85,
      "r_au": 1.87,
      "a_au": 2.41,
      "q_au": 1.87,
      "e": 0.227,
      "inc_deg": 4.54,
      "varpi_deg": 152.3,
      "T_N": 13.007,
      "size_label": "0.24 km",
      "size_km": 0.24,
      "note_en": "Catalogued 2025 OM380, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_48",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_48"
      ],
      "known_designation": "2025 OM380",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_49",
      "focusId": "SAT3_NEW_49",
      "label": "2025 LH4",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "16.0 d",
      "ra": 316.33008,
      "dec": -13.7442,
      "mag": "22.01 AB",
      "H": 19.95,
      "r_au": 2.184,
      "a_au": 2.42,
      "q_au": 2.09,
      "e": 0.138,
      "inc_deg": 1.88,
      "varpi_deg": 151.3,
      "T_N": 12.972,
      "size_label": "0.36 km",
      "size_km": 0.36,
      "note_en": "Catalogued 2025 LH4, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_49",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_49"
      ],
      "known_designation": "2025 LH4",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_50",
      "focusId": "SAT3_NEW_50",
      "label": "2025 LM5",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "17.0 d",
      "ra": 323.21315,
      "dec": -17.50929,
      "mag": "22.19 AB",
      "H": 19.19,
      "r_au": 2.556,
      "a_au": 2.6,
      "q_au": 2.42,
      "e": 0.07,
      "inc_deg": 9.99,
      "varpi_deg": 158.2,
      "T_N": 12.134,
      "size_label": "0.52 km",
      "size_km": 0.52,
      "note_en": "Catalogued 2025 LM5, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_50",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_50"
      ],
      "known_designation": "2025 LM5",
      "orbit_audit": null
    },
    {
      "id": "SAT3_NEW_52",
      "focusId": "SAT3_NEW_52",
      "label": "2025 QJ106",
      "group": "euclid_gold",
      "facility": "LSST_DP2 + SPHEREx_Spec",
      "date": "20.9 d",
      "ra": 338.87734,
      "dec": -2.05172,
      "mag": "22.28 AB",
      "H": 19.23,
      "r_au": 2.578,
      "a_au": 3.1,
      "q_au": 2.56,
      "e": 0.175,
      "inc_deg": 15.18,
      "varpi_deg": 173.9,
      "T_N": 10.313,
      "size_label": "0.51 km",
      "size_km": 0.51,
      "note_en": "Catalogued 2025 QJ106, recovered in this search. It is not a new discovery.",
      "audit_status": "CATALOGUED_OBJECT",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "INVALID_OR_UNSUPPORTED",
      "audit_id": "SAT3_NEW_52",
      "audit_grade_level": "object",
      "audit_entries": [
        "SAT3_NEW_52"
      ],
      "known_designation": "2025 QJ106",
      "orbit_audit": null
    },
    {
      "id": "ATLAS_3I",
      "focusId": "ATLAS_3I",
      "label": "3I/ATLAS (C/2025 N1)",
      "group": "volatile",
      "facility": "SPHEREx DR1+QR3 (89 clean exp)",
      "date": "2025-12-08..15",
      "ra": 198.42,
      "dec": -14.18,
      "mag": "15.57 Tmag",
      "H": null,
      "r_au": 2.15,
      "a_au": -0.264,
      "q_au": 1.352,
      "e": 6.123,
      "inc_deg": 175.24,
      "varpi_deg": null,
      "T_N": null,
      "size_label": "SPHEREx detects CO (4.67 um) and 12CO2 (4.26 um) emission",
      "size_km": null,
      "note_en": "Audit: IV-SPX-01 [VERIFIED] SPHEREx detects CO (4.67 um) and 12CO2 (4.26 um) emission. IV-SPX-03 [INVALID_OR_UNSUPPORTED] 13CO2 and water detected.",
      "audit_status": "VOLATILE_TARGET",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "VERIFIED",
      "audit_id": null,
      "audit_grade_level": null,
      "audit_entries": [
        "IV-SPX-01",
        "IV-SPX-03"
      ],
      "known_designation": null,
      "orbit_audit": null
    },
    {
      "id": "SW1_29P",
      "focusId": "SW1_29P",
      "label": "29P/Schwassmann–Wachmann 1",
      "group": "volatile",
      "facility": "SPHEREx DR1+QR3 (93 clean exp)",
      "date": "2025-12-08..21",
      "ra": 152.16,
      "dec": 9.84,
      "mag": "17.67 Tmag",
      "H": null,
      "r_au": 6.3,
      "a_au": 6.046,
      "q_au": 5.775,
      "e": 0.045,
      "inc_deg": 9.36,
      "varpi_deg": null,
      "T_N": 5.857,
      "size_label": "SPHEREx detects CO at 4.67 um",
      "size_km": null,
      "note_en": "Audit: IV-SPX-02 [VERIFIED] SPHEREx detects CO at 4.67 um. IV-SPX-03 [INVALID_OR_UNSUPPORTED] 13CO2 and water detected.",
      "audit_status": "VOLATILE_TARGET",
      "is_audited_survivor": false,
      "is_recovery_control": false,
      "audit_verdict": "VERIFIED",
      "audit_id": null,
      "audit_grade_level": null,
      "audit_entries": [
        "IV-SPX-02",
        "IV-SPX-03"
      ],
      "known_designation": null,
      "orbit_audit": null
    }
  ];

/* ==========================================================================
   5. Application State & Deep-Link Builder
   ========================================================================== */
let currentLang = "en";
let activeHgNode = "n_mgdb";

/* Blink Comparator State */
let blinkTargetKey = "DELTA_003";
let blinkEpochIdx = 0;
let blinkAutoPlay = true;
let blinkShowReticle = true;
let blinkDiffMode = false;
let blinkIntervalMs = 650;
let blinkTimer = null;
const starFieldCache = {};

/* Stereoscopic Parallax State */
let stereoTargetKey = "EUC0005";
let stereoFraction = 1.0; // 0 = CTIO Earth, 1 = Euclid L2
let stereoAutoSweep = true;
let stereoSweepDir = -1;
let stereoAnimFrame = null;

/* Ledger State */
let ledgerFilter = "all";
let ledgerAudit = "survivor";
let ledgerSearch = "";
let ledgerSortKey = "r_au";
let ledgerSortAsc = false;

function buildExplorerUrl(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      query.set(k, String(v));
    }
  });
  const cleanBase = EYES_3D_BASE_URL.replace(/\/+$/, "");
  const qStr = query.toString();
  if (!qStr) return cleanBase.endsWith(".html") ? cleanBase : `${cleanBase}/`;
  const sep = cleanBase.endsWith(".html") ? "?" : "/?";
  return `${cleanBase}${sep}${qStr}`;
}

function buildPlaygroundUrl(modelId = "") {
  const base = IS_LOCAL_BLOG_PORT
    ? `${window.location.protocol}//${window.location.hostname}:8765/studio.html`
    : "../eyes_3d/studio.html";
  const query = new URLSearchParams();
  if (modelId && modelId !== "1") query.set("model", modelId);
  const qStr = query.toString();
  return qStr ? `${base}?${qStr}` : base;
}

function syncAllExplorerLinks() {
  document.querySelectorAll(".js-3d-link").forEach((a) => {
    const pg = a.getAttribute("data-playground");
    const focus = a.getAttribute("data-fly-focus");
    const cat = a.getAttribute("data-fly-cat");
    if (pg) {
      a.href = buildPlaygroundUrl(pg);
    } else if (focus) {
      a.href = buildExplorerUrl({ focus });
    } else if (cat) {
      a.href = buildExplorerUrl({ category: cat });
    } else {
      a.href = buildExplorerUrl({});
    }
  });
}

/* Counts shown on the page. Ledger counts are taken from the rows themselves, so a filter chip can
   never disagree with the table; every other figure comes from the generated AUDIT_SUMMARY. */
function ledgerCounts() {
  const counts = { ledger_rows: DISCOVERY_LEDGER.length, ledger_survivors: 0, ledger_disputed: 0, ledger_known: 0, ledger_volatile: 0 };
  DISCOVERY_LEDGER.forEach((row) => {
    counts[`ledger_group_${row.group}`] = (counts[`ledger_group_${row.group}`] || 0) + 1;
    if (row.audit_status === "AUDITED_SURVIVOR") counts.ledger_survivors += 1;
    else if (row.audit_status === "DISPUTED_CLAIM") counts.ledger_disputed += 1;
    else if (row.audit_status === "CATALOGUED_OBJECT" || row.audit_status === "RECOVERY_CONTROL") counts.ledger_known += 1;
    else if (row.audit_status === "VOLATILE_TARGET") counts.ledger_volatile += 1;
  });
  return counts;
}

const AUDIT_VALUES = { ...AUDIT_SUMMARY, ...ledgerCounts() };

function auditValue(name, lang) {
  if (name.endsWith("_words")) {
    const words = AUDIT_SUMMARY.words || {};
    return (words[lang] || words.en || {})[name.slice(0, -6)];
  }
  return AUDIT_VALUES[name];
}

/* Replace {{name}} with a count and {{name_words}} with the count in words. */
function fillAuditTokens(text, lang = currentLang) {
  if (typeof text !== "string" || text.indexOf("{{") === -1) return text;
  return text.replace(/\{\{([a-z0-9_]+)\}\}/g, (whole, name) => {
    const value = auditValue(name, lang);
    return value === undefined || value === null || typeof value === "object" ? whole : String(value);
  });
}

function applyAuditStats() {
  document.querySelectorAll("[data-audit-stat]").forEach((el) => {
    const value = AUDIT_VALUES[el.getAttribute("data-audit-stat")];
    if (value !== undefined && value !== null && typeof value !== "object") el.textContent = String(value);
  });
}

function escapeHtml(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function t(key) {
  const dict = I18N[currentLang] || I18N.en;
  const raw = dict[key] !== undefined ? dict[key] : (I18N.en[key] || key);
  return fillAuditTokens(raw);
}

/* ==========================================================================
   6. Language & Theme Controllers (Extensible Locale Architecture)
   ========================================================================== */
function registerLocale(code, bundle) {
  I18N[code] = { ...I18N.en, ...bundle };
}

function setLanguage(_langCode, updateHistory = true) {
  const next = "en";
  currentLang = next;
  document.documentElement.lang = "en";
  document.title = t("doc_title");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && I18N.en[key] !== undefined) {
      el.textContent = fillAuditTokens(I18N.en[key], "en");
    }
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key && I18N.en[key] !== undefined) {
      el.innerHTML = fillAuditTokens(I18N.en[key], "en");
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key && I18N.en[key] !== undefined) {
      el.setAttribute("placeholder", fillAuditTokens(I18N.en[key], "en"));
    }
  });

  applyAuditStats();
  updateThemeButtonLabel();
  updateBlinkButtonLabels();
  updateStereoButtonLabels();
  selectHypergraphNode(activeHgNode);
  renderLedgerTable();
  syncAllExplorerLinks();
  drawBlinkCanvas();
  drawStereoCanvas();

  if (updateHistory && window.history && window.history.replaceState) {
    const url = new URL(window.location.href);
    url.searchParams.delete("lang");
    window.history.replaceState({}, "", url.toString());
  }
}

function updateThemeButtonLabel() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const lbl = document.getElementById("theme-label");
  if (lbl) {
    lbl.textContent = isDark ? t("theme_light") : t("theme_dark");
  }
}

function initTheme() {
  let saved = null;
  try {
    saved = window.localStorage.getItem("discovery_blog_theme");
  } catch (_) { }
  const initial = saved === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", initial);
  updateThemeButtonLabel();

  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        window.localStorage.setItem("discovery_blog_theme", next);
      } catch (_) { }
      updateThemeButtonLabel();
      drawBlinkCanvas();
      drawStereoCanvas();
    });
  }
}

/* ==========================================================================
   7. Seeded Starfield Generator & Widget 1: Interactive Blink Comparator
   ========================================================================== */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t0 = Math.imul(a ^ (a >>> 15), 1 | a);
    t0 = (t0 + Math.imul(t0 ^ (t0 >>> 7), 61 | t0)) ^ t0;
    return ((t0 ^ (t0 >>> 14)) >>> 0) / 4294967296;
  };
}

function getStarField(key, count, seed) {
  if (starFieldCache[key]) return starFieldCache[key];
  const rng = mulberry32(seed);
  const stars = [];
  for (let i = 0; i < count; i++) {
    const u = rng();
    const v = rng();
    const lum = Math.pow(rng(), 2.6); // realistic power-law star brightness
    const warm = rng();
    let tint = "225, 236, 255";
    if (warm > 0.78) tint = "255, 224, 188";
    else if (warm > 0.45) tint = "244, 246, 250";
    stars.push({
      u,
      v,
      r: 0.75 + lum * 2.45,
      alpha: 0.24 + lum * 0.74,
      tint,
      diffr: lum > 0.86
    });
  }
  starFieldCache[key] = stars;
  return stars;
}

function skyToCanvas(ra, dec, cfg, plotBox) {
  // Astronomical convention: East (+RA) to the left, North (+Dec) up
  const u = 0.5 - (ra - cfg.raCenter) / cfg.spanDegRA;
  const v = 0.5 - (dec - cfg.decCenter) / cfg.spanDegDec;
  return {
    x: plotBox.x + u * plotBox.w,
    y: plotBox.y + v * plotBox.h
  };
}

function updateBlinkButtonLabels() {
  const playBtn = document.getElementById("blink-play-btn");
  if (playBtn) {
    playBtn.textContent = blinkAutoPlay ? t("w1_auto_on") : t("w1_auto_off");
    playBtn.classList.toggle("active", blinkAutoPlay);
  }
  const cfg = BLINK_TARGETS[blinkTargetKey];
  const flyBtn = document.getElementById("blink-fly-link");
  if (flyBtn && cfg) {
    flyBtn.setAttribute("data-fly-focus", cfg.focusId);
    flyBtn.textContent = cfg.fly_en;
    flyBtn.href = buildExplorerUrl({ focus: cfg.focusId });
  }
  document.querySelectorAll("[data-blink-epoch]").forEach((btn) => {
    const idx = Number(btn.getAttribute("data-blink-epoch"));
    btn.textContent = `Epoch ${idx + 1}`;
    btn.classList.toggle("active", idx === blinkEpochIdx);
  });
}

function drawBlinkCanvas() {
  const canvas = document.getElementById("blink-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = canvas.clientWidth || 980;
  const cssH = Math.round(cssW * (470 / 980));
  if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
  }
  ctx.save();
  ctx.scale(dpr, dpr);

  const cfg = BLINK_TARGETS[blinkTargetKey];
  const ep = cfg.epochs[blinkEpochIdx];

  // Background sky
  ctx.fillStyle = blinkDiffMode ? "#0b1017" : "#05080f";
  ctx.fillRect(0, 0, cssW, cssH);

  const padL = 58;
  const padR = 22;
  const padT = 36;
  const padB = 38;
  const plot = { x: padL, y: padT, w: cssW - padL - padR, h: cssH - padT - padB };

  // Subtle coordinate grid
  ctx.strokeStyle = "rgba(120, 148, 185, 0.14)";
  ctx.lineWidth = 1;
  for (let gx = 1; gx <= 4; gx++) {
    const xp = plot.x + (plot.w * gx) / 5;
    ctx.beginPath();
    ctx.moveTo(xp, plot.y);
    ctx.lineTo(xp, plot.y + plot.h);
    ctx.stroke();
  }
  for (let gy = 1; gy <= 3; gy++) {
    const yp = plot.y + (plot.h * gy) / 4;
    ctx.beginPath();
    ctx.moveTo(plot.x, yp);
    ctx.lineTo(plot.x + plot.w, yp);
    ctx.stroke();
  }

  // Subtle epoch-specific read noise speckles
  const noiseRng = mulberry32(cfg.seed * 31 + blinkEpochIdx * 97);
  for (let n = 0; n < 130; n++) {
    const nx = plot.x + noiseRng() * plot.w;
    const ny = plot.y + noiseRng() * plot.h;
    ctx.fillStyle = `rgba(170, 195, 230, ${0.03 + noiseRng() * 0.05})`;
    ctx.fillRect(nx, ny, 1.4, 1.4);
  }

  // Field Stars (Frozen across all epochs; subtracted to faint residuals in Difference Mode)
  const stars = getStarField(blinkTargetKey, cfg.starCount, cfg.seed);
  stars.forEach((st) => {
    const sx = plot.x + st.u * plot.w;
    const sy = plot.y + st.v * plot.h;
    if (blinkDiffMode) {
      ctx.strokeStyle = "rgba(130, 150, 175, 0.13)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, st.r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, st.r * 2.4);
    grad.addColorStop(0, `rgba(${st.tint}, ${st.alpha})`);
    grad.addColorStop(0.45, `rgba(${st.tint}, ${st.alpha * 0.35})`);
    grad.addColorStop(1, `rgba(${st.tint}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, st.r * 2.4, 0, Math.PI * 2);
    ctx.fill();

    if (st.diffr && cfg.isStreak) {
      // Euclid Korsch diffraction spikes on bright stars
      ctx.strokeStyle = `rgba(${st.tint}, 0.32)`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(sx - 7, sy);
      ctx.lineTo(sx + 7, sy);
      ctx.moveTo(sx, sy - 7);
      ctx.lineTo(sx, sy + 7);
      ctx.stroke();
    }
  });

  // Optional Trajectory & Ghost Epoch Positions when Reticle is ON
  if (blinkShowReticle) {
    ctx.save();
    ctx.strokeStyle = "rgba(240, 130, 91, 0.45)";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    cfg.fullCurve.forEach(([rDeg, dDeg], idx) => {
      const pt = skyToCanvas(rDeg, dDeg, cfg, plot);
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    cfg.epochs.forEach((eItem, idx) => {
      if (idx === blinkEpochIdx) return;
      const gpt = skyToCanvas(eItem.ra, eItem.dec, cfg, plot);
      ctx.strokeStyle = "rgba(240, 130, 91, 0.42)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(gpt.x, gpt.y, 4.2, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  // Draw the Moving Solar System Body at the Active Epoch!
  const tPt = skyToCanvas(ep.ra, ep.dec, cfg, plot);
  if (cfg.isStreak) {
    // Elongated 560.5s Euclid VIS Asteroid Streak at PA = 57.4 deg (East-left -> up-left)
    const paRad = ((cfg.paDeg || 57.4) * Math.PI) / 180;
    const halfLen = 14;
    const dx = -Math.sin(paRad) * halfLen;
    const dy = -Math.cos(paRad) * halfLen;

    ctx.strokeStyle = "rgba(195, 248, 225, 0.35)";
    ctx.lineWidth = 6.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tPt.x - dx, tPt.y - dy);
    ctx.lineTo(tPt.x + dx, tPt.y + dy);
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(tPt.x - dx, tPt.y - dy);
    ctx.lineTo(tPt.x + dx, tPt.y + dy);
    ctx.stroke();
  } else {
    // Point-Spread Function of TNO
    const psfR = blinkTargetKey === "EPS_002" ? 8.2 : 6.8;
    const pGrad = ctx.createRadialGradient(tPt.x, tPt.y, 0, tPt.x, tPt.y, psfR);
    pGrad.addColorStop(0, "#ffffff");
    pGrad.addColorStop(0.35, "rgba(255, 232, 195, 0.92)");
    pGrad.addColorStop(1, "rgba(240, 130, 91, 0)");
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(tPt.x, tPt.y, psfR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Target Reticle Crosshairs
  if (blinkShowReticle) {
    ctx.strokeStyle = ep.color || "#f0825b";
    ctx.lineWidth = 1.7;
    const rOut = cfg.isStreak ? 21 : 14;
    ctx.beginPath();
    ctx.arc(tPt.x, tPt.y, rOut, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tPt.x - rOut - 6, tPt.y);
    ctx.lineTo(tPt.x - rOut + 2, tPt.y);
    ctx.moveTo(tPt.x + rOut - 2, tPt.y);
    ctx.lineTo(tPt.x + rOut + 6, tPt.y);
    ctx.moveTo(tPt.x, tPt.y - rOut - 6);
    ctx.lineTo(tPt.x, tPt.y - rOut + 2);
    ctx.moveTo(tPt.x, tPt.y + rOut - 2);
    ctx.lineTo(tPt.x, tPt.y + rOut + 6);
    ctx.stroke();

    ctx.fillStyle = ep.color || "#f0825b";
    ctx.font = '600 11.5px "CMU Serif", Georgia, serif';
    ctx.fillText(`E${blinkEpochIdx + 1}: ${ep.utc.slice(0, 16)}`, tPt.x + rOut + 8, tPt.y - 5);
  }

  // Frame Border & Axis Tick Readouts
  ctx.strokeStyle = "rgba(160, 182, 212, 0.38)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(plot.x, plot.y, plot.w, plot.h);

  ctx.fillStyle = "#c8d6ea";
  ctx.font = '600 12px "CMU Serif", Georgia, serif';
  ctx.fillText(`${cfg.name}  —  ${cfg.fovLabel}`, plot.x, 22);

  if (blinkDiffMode) {
    ctx.fillStyle = "#44c493";
    ctx.font = '600 11.5px "CMU Serif", Georgia, serif';
    ctx.fillText(t("cv_diff_on"), plot.x + plot.w - 310, 22);
  }

  // RA / Dec Corner Labels & N/E Compass
  ctx.fillStyle = "#8ea2be";
  ctx.font = '11px "CMU Serif", Georgia, serif';
  const raLeft = (cfg.raCenter + cfg.spanDegRA * 0.5).toFixed(3);
  const raRight = (cfg.raCenter - cfg.spanDegRA * 0.5).toFixed(3);
  ctx.fillText(`α = ${raLeft}° (E)`, plot.x, cssH - 12);
  ctx.fillText(`α = ${raRight}° (W)`, plot.x + plot.w - 108, cssH - 12);

  ctx.save();
  ctx.translate(18, plot.y + plot.h * 0.5 + 36);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`δ = ${cfg.decCenter.toFixed(2)}° (ICRS)`, 0, 0);
  ctx.restore();

  // 10x Pixel Cutout Magnifier Loupe (Bottom-Right Inside Plot)
  const loupeSize = 112;
  const lx = plot.x + plot.w - loupeSize - 12;
  const ly = plot.y + plot.h - loupeSize - 12;
  ctx.fillStyle = "#070b12";
  ctx.fillRect(lx, ly, loupeSize, loupeSize);

  const nPix = 19;
  const cell = loupeSize / nPix;
  const pRng = mulberry32(cfg.seed * 19 + blinkEpochIdx * 53);
  for (let py = 0; py < nPix; py++) {
    for (let px = 0; px < nPix; px++) {
      const dx = px - (nPix - 1) / 2;
      const dy = py - (nPix - 1) / 2;
      let signal = 0;
      if (cfg.isStreak) {
        // Streak inclined along PA=57.4 deg
        const rotAlong = dx * (-0.84) + dy * (-0.54);
        const rotCross = dx * 0.54 - dy * 0.84;
        if (Math.abs(rotAlong) < 6.4) {
          signal = Math.exp(-(rotCross * rotCross) / 1.45) * 0.92;
        }
      } else {
        signal = Math.exp(-(dx * dx + dy * dy) / 3.1) * 0.95;
      }
      const bg = (pRng() - 0.3) * 0.16;
      const val = Math.max(0, Math.min(1, 0.08 + bg + signal));
      const rC = Math.round(14 + val * 240);
      const gC = Math.round(22 + val * 196);
      const bC = Math.round(38 + val * 145);
      ctx.fillStyle = `rgb(${rC},${gC},${bC})`;
      ctx.fillRect(lx + px * cell, ly + py * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }
  ctx.strokeStyle = ep.color || "#63a4f4";
  ctx.lineWidth = 1.6;
  ctx.strokeRect(lx, ly, loupeSize, loupeSize);
  ctx.fillStyle = "#e8edf4";
  ctx.font = '600 10px "CMU Serif", Georgia, serif';
  ctx.fillText(t("cv_loupe_title"), lx + 5, ly - 5);

  ctx.restore();

  // Update Telemetry Bar
  const elName = document.getElementById("bt-name");
  const elUtc = document.getElementById("bt-utc");
  const elCoord = document.getElementById("bt-coord");
  const elMag = document.getElementById("bt-mag");
  const elNote = document.getElementById("bt-note");
  if (elName) elName.textContent = cfg.name;
  if (elUtc) elUtc.textContent = `${ep.utc} (MJD ${ep.mjd.toFixed(4)})`;
  if (elCoord) elCoord.textContent = `${ep.ra.toFixed(5)}°, ${ep.dec >= 0 ? "+" : ""}${ep.dec.toFixed(5)}°`;
  if (elMag) elMag.textContent = `${ep.mag} · SNR ${ep.snr.toFixed(1)}`;
  if (elNote) elNote.textContent = cfg.note_en;

  const scrubber = document.getElementById("blink-epoch-slider");
  if (scrubber) scrubber.value = String(blinkEpochIdx);
  document.querySelectorAll("[data-blink-epoch]").forEach((b) => {
    b.classList.toggle("active", Number(b.getAttribute("data-blink-epoch")) === blinkEpochIdx);
  });
}

function restartBlinkTimer() {
  if (blinkTimer) {
    clearInterval(blinkTimer);
    blinkTimer = null;
  }
  if (blinkAutoPlay) {
    blinkTimer = setInterval(() => {
      const cfg = BLINK_TARGETS[blinkTargetKey];
      blinkEpochIdx = (blinkEpochIdx + 1) % cfg.epochs.length;
      drawBlinkCanvas();
    }, blinkIntervalMs);
  }
}

function initBlinkWidget() {
  document.querySelectorAll("[data-blink-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-blink-target");
      if (!BLINK_TARGETS[key]) return;
      blinkTargetKey = key;
      blinkEpochIdx = 0;
      document.querySelectorAll("[data-blink-target]").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-blink-target") === key);
      });
      updateBlinkButtonLabels();
      drawBlinkCanvas();
    });
  });

  document.querySelectorAll("[data-blink-epoch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      blinkAutoPlay = false;
      blinkEpochIdx = Number(btn.getAttribute("data-blink-epoch"));
      restartBlinkTimer();
      updateBlinkButtonLabels();
      drawBlinkCanvas();
    });
  });

  const playBtn = document.getElementById("blink-play-btn");
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      blinkAutoPlay = !blinkAutoPlay;
      restartBlinkTimer();
      updateBlinkButtonLabels();
    });
  }

  const retBtn = document.getElementById("blink-reticle-btn");
  if (retBtn) {
    retBtn.addEventListener("click", () => {
      blinkShowReticle = !blinkShowReticle;
      retBtn.classList.toggle("active", blinkShowReticle);
      drawBlinkCanvas();
    });
  }

  const diffBtn = document.getElementById("blink-diff-btn");
  if (diffBtn) {
    diffBtn.addEventListener("click", () => {
      blinkDiffMode = !blinkDiffMode;
      diffBtn.classList.toggle("active", blinkDiffMode);
      drawBlinkCanvas();
    });
  }

  const scrubber = document.getElementById("blink-epoch-slider");
  if (scrubber) {
    scrubber.addEventListener("input", () => {
      blinkAutoPlay = false;
      blinkEpochIdx = Number(scrubber.value);
      restartBlinkTimer();
      updateBlinkButtonLabels();
      drawBlinkCanvas();
    });
  }

  const speedSlider = document.getElementById("blink-speed-slider");
  if (speedSlider) {
    speedSlider.addEventListener("input", () => {
      blinkIntervalMs = Number(speedSlider.value);
      if (blinkAutoPlay) restartBlinkTimer();
    });
  }

  updateBlinkButtonLabels();
  drawBlinkCanvas();
  restartBlinkTimer();
}

/* ==========================================================================
   8. Widget 2: Interactive 1.685-Million-km L2 × Earth Stereoscopic Slider
   ========================================================================== */
function updateStereoButtonLabels() {
  const sweepBtn = document.getElementById("stereo-sweep-btn");
  if (sweepBtn) {
    sweepBtn.textContent = stereoAutoSweep ? t("w2_sweep_on") : t("w2_sweep_off");
    sweepBtn.classList.toggle("active", stereoAutoSweep);
  }
  const cfg = STEREO_TARGETS[stereoTargetKey];
  const flyBtn = document.getElementById("stereo-fly-link");
  if (flyBtn && cfg) {
    flyBtn.setAttribute("data-fly-focus", cfg.focusId);
    flyBtn.textContent = cfg.fly_en;
    flyBtn.href = buildExplorerUrl({ focus: cfg.focusId });
  }
}

function drawStereoCanvas() {
  const canvas = document.getElementById("parallax-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = canvas.clientWidth || 980;
  const cssH = Math.round(cssW * (440 / 980));
  if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
  }
  ctx.save();
  ctx.scale(dpr, dpr);

  const cfg = STEREO_TARGETS[stereoTargetKey];
  ctx.fillStyle = "#060910";
  ctx.fillRect(0, 0, cssW, cssH);

  const splitX = Math.round(cssW * 0.54);

  /* --- LEFT PANEL: Calibrated Sky-Plane Starfield (125" x 98") --- */
  const sBox = { x: 42, y: 38, w: splitX - 58, h: cssH - 66 };
  ctx.fillStyle = "#04070d";
  ctx.fillRect(sBox.x, sBox.y, sBox.w, sBox.h);

  const raMid = 0.5 * (cfg.raW84 + cfg.raL2);
  const decMid = 0.5 * (cfg.decW84 + cfg.decL2);
  const spanDeg = 130 / 3600; // 130 arcsec wide window

  function toSkyXY(ra, dec) {
    const u = 0.5 - (ra - raMid) / spanDeg;
    const v = 0.5 - (dec - decMid) / (spanDeg * (sBox.h / sBox.w));
    return { x: sBox.x + u * sBox.w, y: sBox.y + v * sBox.h };
  }

  // Grid
  ctx.strokeStyle = "rgba(115, 145, 185, 0.14)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i++) {
    const gx = sBox.x + (sBox.w * i) / 5;
    ctx.beginPath();
    ctx.moveTo(gx, sBox.y);
    ctx.lineTo(gx, sBox.y + sBox.h);
    ctx.stroke();
  }
  for (let j = 1; j <= 3; j++) {
    const gy = sBox.y + (sBox.h * j) / 4;
    ctx.beginPath();
    ctx.moveTo(sBox.x, gy);
    ctx.lineTo(sBox.x + sBox.w, gy);
    ctx.stroke();
  }

  // Unshifted Gaia DR3 Field Stars
  const stars = getStarField(`stereo_${stereoTargetKey}`, 55, cfg.seed);
  stars.forEach((st) => {
    const sx = sBox.x + st.u * sBox.w;
    const sy = sBox.y + st.v * sBox.h;
    ctx.fillStyle = `rgba(${st.tint}, ${st.alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, st.r * 1.15, 0, Math.PI * 2);
    ctx.fill();
  });

  const ptEarth = toSkyXY(cfg.raW84, cfg.decW84);
  const ptL2 = toSkyXY(cfg.raL2, cfg.decL2);
  const curRa = cfg.raW84 + stereoFraction * (cfg.raL2 - cfg.raW84);
  const curDec = cfg.decW84 + stereoFraction * (cfg.decL2 - cfg.decW84);
  const ptCur = toSkyXY(curRa, curDec);

  // Exact Epipolar Baseline Ray
  ctx.strokeStyle = "rgba(68, 196, 147, 0.55)";
  ctx.lineWidth = 1.6;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(ptEarth.x, ptEarth.y);
  ctx.lineTo(ptL2.x, ptL2.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Anchor Rings for CTIO W84 and Euclid 273
  ctx.strokeStyle = "rgba(240, 130, 91, 0.8)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(ptEarth.x, ptEarth.y, 7.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#f0825b";
  ctx.font = '600 11px "CMU Serif", Georgia, serif';
  ctx.fillText("CTIO W84", ptEarth.x - 62, ptEarth.y - 11);

  ctx.strokeStyle = "rgba(99, 164, 244, 0.85)";
  ctx.beginPath();
  ctx.arc(ptL2.x, ptL2.y, 7.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#63a4f4";
  ctx.fillText("Euclid L2 (273)", ptL2.x + 10, ptL2.y + 16);

  // Active TNO PSF shifting smoothly by 64.19" / 66.47"
  const glow = ctx.createRadialGradient(ptCur.x, ptCur.y, 0, ptCur.x, ptCur.y, 13);
  glow.addColorStop(0, "#ffffff");
  glow.addColorStop(0.35, "rgba(130, 210, 255, 0.92)");
  glow.addColorStop(1, "rgba(99, 164, 244, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(ptCur.x, ptCur.y, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(ptCur.x, ptCur.y, 12, 0, Math.PI * 2);
  ctx.stroke();

  const curShift = (stereoFraction * cfg.parallaxArcsec).toFixed(2);
  ctx.fillStyle = "#ffffff";
  ctx.font = '700 11.5px "CMU Serif", Georgia, serif';
  ctx.fillText(`${cfg.name} (Δθ = ${curShift}″)`, ptCur.x + 14, ptCur.y - 10);

  // Scale Bar (30 arcsec)
  const px30 = (30 / 3600 / spanDeg) * sBox.w;
  const sbX = sBox.x + 14;
  const sbY = sBox.y + sBox.h - 16;
  ctx.strokeStyle = "#dce6f5";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sbX, sbY);
  ctx.lineTo(sbX + px30, sbY);
  ctx.stroke();
  ctx.fillStyle = "#dce6f5";
  ctx.font = '10.5px "CMU Serif", Georgia, serif';
  ctx.fillText("30″", sbX + px30 * 0.35, sbY - 6);

  ctx.strokeStyle = "rgba(160, 182, 212, 0.38)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(sBox.x, sBox.y, sBox.w, sBox.h);

  ctx.fillStyle = "#c8d6ea";
  ctx.font = '600 11.5px "CMU Serif", Georgia, serif';
  ctx.fillText(t("cv_sky_view"), sBox.x, 23);
  ctx.fillStyle = "#44c493";
  ctx.font = '10.5px "CMU Serif", Georgia, serif';
  ctx.fillText(t("cv_epipolar"), sBox.x, cssH - 10);

  /* --- RIGHT PANEL: Top-Down Heliocentric Stereoscopic Geometry --- */
  const gBox = { x: splitX + 10, y: 38, w: cssW - splitX - 28, h: cssH - 66 };
  ctx.fillStyle = "#080d16";
  ctx.fillRect(gBox.x, gBox.y, gBox.w, gBox.h);
  ctx.strokeStyle = "rgba(160, 182, 212, 0.32)";
  ctx.strokeRect(gBox.x, gBox.y, gBox.w, gBox.h);

  ctx.fillStyle = "#c8d6ea";
  ctx.font = '600 11.5px "CMU Serif", Georgia, serif';
  ctx.fillText(t("cv_helio_view"), gBox.x, 23);

  const cx = gBox.x + gBox.w * 0.5;
  const sunY = gBox.y + gBox.h - 34;
  const earthX = cx - 64;
  const earthY = sunY - 58;
  const l2X = cx + 68;
  const l2Y = sunY - 72;
  const obsX = earthX + stereoFraction * (l2X - earthX);
  const obsY = earthY + stereoFraction * (l2Y - earthY);
  const tnoX = cx + 6;
  const tnoY = gBox.y + 48;

  // Sightlines from Earth, L2, and Active Observer to TNO
  ctx.strokeStyle = "rgba(240, 130, 91, 0.34)";
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(earthX, earthY);
  ctx.lineTo(tnoX, tnoY);
  ctx.stroke();

  ctx.strokeStyle = "rgba(99, 164, 244, 0.36)";
  ctx.beginPath();
  ctx.moveTo(l2X, l2Y);
  ctx.lineTo(tnoX, tnoY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Active Sightline
  ctx.strokeStyle = "#44c493";
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(obsX, obsY);
  ctx.lineTo(tnoX, tnoY);
  ctx.stroke();

  // Baseline Vector B_{L2 - W84}
  ctx.strokeStyle = "#dce6f5";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(earthX, earthY);
  ctx.lineTo(l2X, l2Y);
  ctx.stroke();

  // Sun, Earth, L2, Observer, and TNO Nodes
  ctx.fillStyle = "#f5c451";
  ctx.beginPath();
  ctx.arc(cx - 20, sunY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '10.5px "CMU Serif", Georgia, serif';
  ctx.fillText(t("cv_sun"), cx - 6, sunY + 4);

  ctx.fillStyle = "#f0825b";
  ctx.beginPath();
  ctx.arc(earthX, earthY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText(t("cv_earth_w84"), earthX - 42, earthY + 18);

  ctx.fillStyle = "#63a4f4";
  ctx.beginPath();
  ctx.arc(l2X, l2Y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText(t("cv_euclid_273"), l2X - 38, l2Y + 18);

  ctx.fillStyle = "#44c493";
  ctx.beginPath();
  ctx.arc(obsX, obsY, 6.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(tnoX, tnoY, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '700 12px "CMU Serif", Georgia, serif';
  ctx.fillStyle = "#63a4f4";
  ctx.fillText(`${cfg.name}: d_L2 = ${cfg.dL2Au.toFixed(2)} ± ${cfg.dErrAu.toFixed(2)} AU`, gBox.x + 18, tnoY - 16);

  ctx.fillStyle = "#b8c7dc";
  ctx.font = '11px "CMU Serif", Georgia, serif';
  ctx.fillText(t("cv_decam_note"), gBox.x + 18, gBox.y + gBox.h * 0.46);
  ctx.fillText(`B_L2-W84 = 1,685,391 km (0.01127 AU)`, gBox.x + 18, gBox.y + gBox.h * 0.53);
  ctx.fillText(`Δθ_full  = ${cfg.parallaxArcsec.toFixed(2)}″  (r_helio = ${cfg.rHelioAu.toFixed(2)} AU)`, gBox.x + 18, gBox.y + gBox.h * 0.60);

  ctx.restore();

  // Telemetry Readout Strip
  const kmNow = Math.round(stereoFraction * cfg.baselineKm).toLocaleString("en-US");
  const pct = Math.round(stereoFraction * 100);
  const elKm = document.getElementById("st-km");
  const elShift = document.getElementById("st-shift");
  const elDist = document.getElementById("st-dist");
  const elEmin = document.getElementById("st-emin");
  if (elKm) elKm.textContent = `${kmNow} km (${pct}% L2)`;
  if (elShift) elShift.textContent = `${(stereoFraction * cfg.parallaxArcsec).toFixed(2)}″ / ${cfg.parallaxArcsec.toFixed(2)}″ (Δ⊥ = 0.00″)`;
  if (elDist) elDist.textContent = `d = ${cfg.dL2Au.toFixed(2)} ± ${cfg.dErrAu.toFixed(2)} AU (${t("cv_if_matched")})`;
  if (elEmin) elEmin.textContent = `e ≥ ${cfg.eMin.toFixed(3)}, a ≥ ${cfg.aMin.toFixed(2)} AU`;

  const slider = document.getElementById("stereo-baseline-slider");
  if (slider) slider.value = String(Math.round(stereoFraction * 1000));
}

function stepStereoSweep() {
  if (!stereoAutoSweep) {
    stereoAnimFrame = null;
    return;
  }
  stereoFraction += stereoSweepDir * 0.0045;
  if (stereoFraction <= 0) {
    stereoFraction = 0;
    stereoSweepDir = 1;
  } else if (stereoFraction >= 1) {
    stereoFraction = 1;
    stereoSweepDir = -1;
  }
  drawStereoCanvas();
  stereoAnimFrame = window.requestAnimationFrame(stepStereoSweep);
}

function initStereoWidget() {
  document.querySelectorAll("[data-stereo-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-stereo-target");
      if (!STEREO_TARGETS[key]) return;
      stereoTargetKey = key;
      document.querySelectorAll("[data-stereo-target]").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-stereo-target") === key);
      });
      updateStereoButtonLabels();
      drawStereoCanvas();
    });
  });

  const slider = document.getElementById("stereo-baseline-slider");
  if (slider) {
    slider.addEventListener("input", () => {
      stereoAutoSweep = false;
      stereoFraction = Number(slider.value) / 1000;
      updateStereoButtonLabels();
      drawStereoCanvas();
    });
  }

  const earthBtn = document.getElementById("stereo-earth-btn");
  if (earthBtn) {
    earthBtn.addEventListener("click", () => {
      stereoAutoSweep = false;
      stereoFraction = 0;
      updateStereoButtonLabels();
      drawStereoCanvas();
    });
  }

  const l2Btn = document.getElementById("stereo-l2-btn");
  if (l2Btn) {
    l2Btn.addEventListener("click", () => {
      stereoAutoSweep = false;
      stereoFraction = 1;
      updateStereoButtonLabels();
      drawStereoCanvas();
    });
  }

  const sweepBtn = document.getElementById("stereo-sweep-btn");
  if (sweepBtn) {
    sweepBtn.addEventListener("click", () => {
      stereoAutoSweep = !stereoAutoSweep;
      updateStereoButtonLabels();
      if (stereoAutoSweep && !stereoAnimFrame) {
        stereoAnimFrame = window.requestAnimationFrame(stepStereoSweep);
      }
    });
  }

  updateStereoButtonLabels();
  drawStereoCanvas();
  if (stereoAutoSweep) {
    stereoAnimFrame = window.requestAnimationFrame(stepStereoSweep);
  }
}

/* ==========================================================================
   9. Interactive SVG Capability Decomposition & Synthesis Hypergraph
   ========================================================================== */
function selectHypergraphNode(nodeId) {
  if (!HYPERGRAPH_DETAILS[nodeId]) return;
  activeHgNode = nodeId;
  const info = HYPERGRAPH_DETAILS[nodeId][currentLang] || HYPERGRAPH_DETAILS[nodeId].en;

  const connectedNodes = new Set([nodeId]);
  document.querySelectorAll(".hg-edge").forEach((edge) => {
    const f = edge.getAttribute("data-from");
    const to = edge.getAttribute("data-to");
    const isHit = f === nodeId || to === nodeId || nodeId === "n_mgdb";
    edge.classList.toggle("highlighted", f === nodeId || to === nodeId);
    edge.classList.toggle("dimmed", !isHit);
    if (f === nodeId) connectedNodes.add(to);
    if (to === nodeId) connectedNodes.add(f);
  });

  document.querySelectorAll(".hg-node").forEach((g) => {
    const id = g.getAttribute("data-hg-id");
    g.classList.toggle("active", id === nodeId);
    g.classList.toggle("dimmed", nodeId !== "n_mgdb" && !connectedNodes.has(id));
  });

  const titleEl = document.getElementById("hg-detail-title");
  const descEl = document.getElementById("hg-detail-desc");
  const linkEl = document.getElementById("hg-detail-link");
  if (titleEl) titleEl.textContent = fillAuditTokens(info.title);
  if (descEl) descEl.textContent = fillAuditTokens(info.desc);
  if (linkEl && info.fly) {
    if (info.fly.focus) {
      linkEl.setAttribute("data-fly-focus", info.fly.focus);
      linkEl.removeAttribute("data-fly-cat");
    } else if (info.fly.category) {
      linkEl.setAttribute("data-fly-cat", info.fly.category);
      linkEl.removeAttribute("data-fly-focus");
    }
    linkEl.href = buildExplorerUrl(info.fly);
  }
}

function initHypergraph() {
  document.querySelectorAll(".hg-node").forEach((node) => {
    const id = node.getAttribute("data-hg-id");
    node.addEventListener("click", () => selectHypergraphNode(id));
    node.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        selectHypergraphNode(id);
      }
    });
  });
  selectHypergraphNode("n_mgdb");
}

/* ==========================================================================
   10. Searchable & Sortable Audited Discovery Ledger
   ========================================================================== */
const AUDIT_STATUS_META = {
  AUDITED_SURVIVOR: { cls: "audit-survivor", key: "st_survivor" },
  DISPUTED_CLAIM: { cls: "audit-disputed", key: "st_disputed" },
  RECOVERY_CONTROL: { cls: "audit-known", key: "st_control" },
  CATALOGUED_OBJECT: { cls: "audit-known", key: "st_catalogued" },
  VOLATILE_TARGET: { cls: "audit-volatile", key: "st_volatile" }
};

const AUDIT_FILTERS = {
  all: () => true,
  survivor: (row) => row.audit_status === "AUDITED_SURVIVOR",
  disputed: (row) => row.audit_status === "DISPUTED_CLAIM",
  known: (row) => row.audit_status === "CATALOGUED_OBJECT" || row.audit_status === "RECOVERY_CONTROL",
  volatile: (row) => row.audit_status === "VOLATILE_TARGET"
};

const VERDICT_LABEL_KEYS = {
  VERIFIED: "vd_verified",
  PLAUSIBLE_NEEDS_FOLLOWUP: "vd_plausible",
  DISPUTED_OR_OVERCLAIMED: "vd_disputed",
  INVALID_OR_UNSUPPORTED: "vd_invalid"
};

function fmtVal(v, digits = 2) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "—";
  return Number(v).toFixed(digits);
}

function isMissing(v) {
  return v === null || v === undefined;
}

/* One-line audit grade under the status badge. A row whose status is unknown is shown as disputed,
   so nothing is presented as a survivor unless the generated ledger says it is one. */
function auditLineFor(row) {
  const parts = [];
  if (VERDICT_LABEL_KEYS[row.audit_verdict]) parts.push(t(VERDICT_LABEL_KEYS[row.audit_verdict]));
  if (row.audit_id) parts.push(row.audit_id);
  if (row.audit_grade_level === "object") parts.push(t("gl_object"));
  else if (row.audit_grade_level === "claim") parts.push(`${t("gl_claim")} ${(row.audit_entries || []).join(", ")}`.trim());
  else if ((row.audit_entries || []).length) parts.push(row.audit_entries.join(", "));
  return parts.join(" · ");
}

function renderLedgerTable() {
  const tbody = document.getElementById("ledger-tbody");
  if (!tbody) return;

  const q = ledgerSearch.trim().toLowerCase();
  const auditTest = AUDIT_FILTERS[ledgerAudit] || AUDIT_FILTERS.all;
  const filtered = DISCOVERY_LEDGER.filter((row) => {
    if (ledgerFilter !== "all" && row.group !== ledgerFilter) return false;
    if (!auditTest(row)) return false;
    if (!q) return true;
    const hay = [
      row.id, row.label, row.facility, row.note_en, row.note_zh, row.size_label,
      row.audit_status, row.audit_verdict, row.audit_id, row.known_designation
    ].join(" ").toLowerCase();
    return hay.includes(q);
  });

  filtered.sort((a, b) => {
    const va = a[ledgerSortKey];
    const vb = b[ledgerSortKey];
    if (isMissing(va) && isMissing(vb)) return 0;
    if (isMissing(va)) return 1;
    if (isMissing(vb)) return -1;
    if (typeof va === "string" || typeof vb === "string") {
      return ledgerSortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    }
    return ledgerSortAsc ? va - vb : vb - va;
  });

  const rowsHtml = filtered
    .map((r) => {
      const note = r.note_en || "";
      const flyUrl = buildExplorerUrl({ focus: r.focusId });
      const status = AUDIT_STATUS_META[r.audit_status] || AUDIT_STATUS_META.DISPUTED_CLAIM;
      const orbitOpen = r.orbit_audit === "DISPUTED_OR_OVERCLAIMED" || r.orbit_audit === "INVALID_OR_UNSUPPORTED";
      const dagger = orbitOpen ? `<sup class="orbit-dagger" title="${escapeHtml(t("orbit_open_tip"))}">†</sup>` : "";
      const elemCls = orbitOpen ? "mono-cell orbit-open" : "mono-cell";
      const hStr = !isMissing(r.H) ? ` / H=${Number(r.H).toFixed(2)}` : "";
      const rDigits = !isMissing(r.r_au) && r.r_au < 10 ? 3 : 2;
      const aDigits = !isMissing(r.a_au) && Math.abs(r.a_au) < 10 ? 3 : 2;
      const qDigits = !isMissing(r.q_au) && r.q_au < 10 ? 3 : 2;
      const coord = isMissing(r.ra) || isMissing(r.dec)
        ? "—"
        : `${Number(r.ra).toFixed(4)}°, ${r.dec >= 0 ? "+" : ""}${Number(r.dec).toFixed(4)}°`;
      const auditLine = auditLineFor(r);

      return `<tr class="ledger-row ${status.cls}-row" title="${escapeHtml(note)}">
        <td>
          <span class="group-pill group-${escapeHtml(r.group)}">${escapeHtml(r.label)}</span>
          <div class="audit-badge ${status.cls}">${escapeHtml(t(status.key))}</div>
          ${auditLine ? `<div class="audit-line">${escapeHtml(auditLine)}</div>` : ""}
        </td>
        <td>
          <div>${escapeHtml(r.facility)}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">${escapeHtml(r.date)}</div>
        </td>
        <td class="mono-cell">${coord}</td>
        <td class="mono-cell">${escapeHtml(r.mag)}${hStr}</td>
        <td class="mono-cell"><strong>${fmtVal(r.r_au, rDigits)}</strong></td>
        <td class="${elemCls}">${fmtVal(r.a_au, aDigits)}${dagger}</td>
        <td class="${elemCls}">${fmtVal(r.q_au, qDigits)}</td>
        <td class="${elemCls}">${fmtVal(r.e, 3)}</td>
        <td class="${elemCls}">${fmtVal(r.inc_deg, 2)}</td>
        <td class="${elemCls}">${!isMissing(r.varpi_deg) ? fmtVal(r.varpi_deg, 1) : "—"}</td>
        <td class="${elemCls}">${!isMissing(r.T_N) ? fmtVal(r.T_N, 3) : "—"}</td>
        <td>
          <div class="${elemCls}">${escapeHtml(r.size_label)}${orbitOpen && r.audit_grade_level === "object" && r.group === "euclid_gold" ? dagger : ""}</div>
          <div class="ledger-note">${escapeHtml(note)}</div>
        </td>
        <td>
          <a href="${flyUrl}" target="_blank" rel="noopener" class="fly-badge js-3d-link" data-fly-focus="${escapeHtml(r.focusId)}">${t("fly_row_btn")}</a>
        </td>
      </tr>`;
    })
    .join("");

  tbody.innerHTML = rowsHtml;

  const summaryEl = document.getElementById("ledger-summary");
  if (summaryEl) {
    summaryEl.textContent = t("ledger_summary_fmt")
      .replace("{shown}", String(filtered.length))
      .replace("{total}", String(DISCOVERY_LEDGER.length));
  }
}

function initLedger() {
  document.querySelectorAll("[data-ledger-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      ledgerFilter = btn.getAttribute("data-ledger-filter");
      document.querySelectorAll("[data-ledger-filter]").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-ledger-filter") === ledgerFilter);
      });
      renderLedgerTable();
    });
  });

  document.querySelectorAll("[data-ledger-audit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      ledgerAudit = btn.getAttribute("data-ledger-audit");
      document.querySelectorAll("[data-ledger-audit]").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-ledger-audit") === ledgerAudit);
      });
      renderLedgerTable();
    });
  });

  const searchInput = document.getElementById("ledger-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      ledgerSearch = searchInput.value || "";
      renderLedgerTable();
    });
  }

  document.querySelectorAll("#discovery-ledger-table th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.getAttribute("data-sort");
      if (ledgerSortKey === key) {
        ledgerSortAsc = !ledgerSortAsc;
      } else {
        ledgerSortKey = key;
        ledgerSortAsc = key === "label" || key === "inc_deg";
      }
      renderLedgerTable();
    });
  });

  renderLedgerTable();
}

/* ==========================================================================
   11. Click-to-Zoom Lightbox, GIF Graceful Fallback & TOC Scroll-Spy
   ========================================================================== */
function initLightboxAndGifs() {
  const modal = document.getElementById("lightbox-modal");
  const modalImg = document.getElementById("lightbox-img");
  const modalCap = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close-btn");

  function closeModal() {
    if (modal) modal.hidden = true;
  }

  document.querySelectorAll(".js-zoomable").forEach((img) => {
    img.addEventListener("click", () => {
      if (!modal || !modalImg || img.hidden) return;
      modalImg.src = img.src;
      modalImg.alt = img.alt || "";
      const fig = img.closest("figure");
      const cap = fig ? fig.querySelector("figcaption") : null;
      if (modalCap) modalCap.textContent = cap ? cap.textContent : img.alt;
      modal.hidden = false;
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) closeModal();
    });
  }
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  // Graceful fallback + live auto-retry for the 5 animated GIFs in assets/gifs/
  document.querySelectorAll(".js-gif-asset").forEach((img) => {
    const gifId = img.getAttribute("data-gif-id");
    const fb = document.getElementById(`fallback-${gifId}`);
    const baseSrc = img.getAttribute("src");
    let retries = 0;

    function showFallback() {
      img.hidden = true;
      if (fb) fb.hidden = false;
      if (retries < 15) {
        retries += 1;
        setTimeout(() => {
          const probe = new Image();
          probe.onload = () => {
            img.src = `${baseSrc}?v=${Date.now()}`;
            img.hidden = false;
            if (fb) fb.hidden = true;
          };
          probe.onerror = showFallback;
          probe.src = `${baseSrc}?v=${Date.now()}`;
        }, 7000);
      }
    }

    img.addEventListener("error", showFallback, { once: true });
    img.addEventListener("load", () => {
      img.hidden = false;
      if (fb) fb.hidden = true;
    });
    if (img.complete && img.naturalWidth === 0) {
      showFallback();
    }
  });
}

function initScrollSpy() {
  const sections = Array.from(document.querySelectorAll(".paper-section[id]"));
  const links = Array.from(document.querySelectorAll(".toc-link"));
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = `#${entry.target.id}`;
          links.forEach((lnk) => {
            lnk.classList.toggle("active", lnk.getAttribute("href") === id);
          });
        }
      });
    },
    { rootMargin: "-18% 0px -68% 0px", threshold: 0 }
  );

  sections.forEach((sec) => observer.observe(sec));
}

function initCompanionDataToggle() {
  const details = document.getElementById("companion-data-details");
  if (!details) return;
  const openIfTargetHash = () => {
    const h = window.location.hash;
    if (h === "#sec-ledger" || h === "#sec-audit") {
      details.open = true;
    }
  };
  openIfTargetHash();
  window.addEventListener("hashchange", openIfTargetHash);
  document.querySelectorAll('a[href="#sec-ledger"], a[href="#sec-audit"]').forEach((lnk) => {
    lnk.addEventListener("click", () => {
      details.open = true;
    });
  });
}

/* ==========================================================================
   12. Bootstrap on DOMContentLoaded
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initBlinkWidget();
  initStereoWidget();
  initHypergraph();
  initLedger();
  initCompanionDataToggle();
  initLightboxAndGifs();
  initScrollSpy();

  setLanguage("en", false);

  window.addEventListener("resize", () => {
    drawBlinkCanvas();
    drawStereoCanvas();
  });
});

window.BlogI18N = {
  I18N,
  registerLocale,
  setLanguage,
  getLanguage: () => currentLang,
  EYES_3D_BASE_URL,
  buildExplorerUrl,
  buildPlaygroundUrl,
  fillAuditTokens,
  AUDIT_SUMMARY
};
