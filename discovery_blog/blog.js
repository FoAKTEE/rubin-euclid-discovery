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
   1. Extensible Multi-Language Dictionary (Default: 100% Pure English "en")
   ========================================================================== */
const I18N = {
  en: {
    doc_title: "Multi-Telescope Solar System Discovery Monograph — Blind Parallax, L2 Stereoscopy, and Spaceborne Volatiles",
    nav_journal: "Research Monograph",
    nav_title: "Agentic Multi-Telescope Solar System Auto-Discovery",
    nav_cta_3d: "Launch 3D Explorer ↗",
    theme_dark: "Dark",
    theme_light: "Light",

    hero_kicker: "Multi-Telescope Discovery Monograph · Solar System to Milky Way",
    hero_title: "Blind Barycentric Parallax, Space–Ground Stereoscopy, and Transient-Preserving Spectroscopy Across the Solar System",
    hero_authors: "Multi-Telescope Discovery Collaboration",
    hero_affil: "{{survivors}} Audited Solar System Candidates out of {{claims}} Pre-Audit Claims · {{movie_targets}} Real-Pixel Archival Movie Targets · Modular GPU+CPU Search Infrastructure",

    abstract_heading: "Abstract",
    abstract_body:
      "Wide-field optical and infrared sky surveys record thousands of uncatalogued Solar System planetesimals whose apparent motion defeats single-instrument pairing thresholds. Beyond the Kuiper cliff, intra-night angular displacement falls below atmospheric seeing, stranding distant movers as unlinked single-visit detections while short opposition arcs leave radial motion degenerate along the line of sight. Closer to the Sun, fast asteroid streaks trigger cosmic-ray pixel masks on spaceborne detectors, crowded Milky Way starfields obscure bright distant bodies, and static-sky outlier rejection strips emission bands from moving cometary comae. By decomposing published survey failure modes inside a structured method database and coupling barycentric double-cone parallax linking on Vera C. Rubin Observatory difference and single-visit catalogs, simultaneous Sun–Earth Lagrange-point stereoscopy between ESA Euclid and Cerro Tololo, spaceborne streak astrometry with live artificial-satellite propagation vetoes, and transient-preserving spectrophotometry on NASA SPHEREx, our cross-archive architecture put forward {{claims_words}} Solar System discovery claims across more than a dozen public archives. An independent audit that repeated the archive queries, orbit fits, and pixel measurements retains {{survivors_words}} of them as candidates awaiting follow-up: {{tnos_words}} trans-Neptunian objects, {{centaurs_words}} Centaur, {{moons_words}} candidate irregular satellites of Jupiter, and {{asteroids_words}} short-arc asteroid candidates. It matched {{catalogued_words}} claims to previously catalogued bodies, eliminated {{eliminated_words}}, and left {{disputed_words}} in dispute; none of those is counted. Real archival pixels for {{movie_targets_words}} targets, with no synthetic frame among them, accompany this monograph, and the same audit confirms carbon monoxide emission in an active Centaur and carbon monoxide and carbon dioxide emission in an interstellar comet. Extending the same modular GPU and CPU astrometric-photometric framework across Gaia, Euclid, and Rubin carries the search from Solar System dynamics to faint high-proper-motion stars and compact-binary candidates across the Milky Way.",

    hero_cta_primary: "Launch 3D Solar System & Galaxy Explorer ↗",
    hero_cta_playground: "Interactive 3D Playground ↗",
    hero_cta_discoveries: "{{survivors}} Audited Orbits in 3D ↗",
    hero_cta_oort: "Zoom Out to Inner Oort Cloud ↗",
    hero_quick_fly: "Direct 3D Fly-To:",

    toc_title: "Contents",
    toc_s1: "I. Sky-Plane Motion & Blink Recovery",
    toc_s2: "II. Quadrature Collapse & Inclination Floor",
    toc_s3: "III. L2 × Earth Stereoscopic Parallax",
    toc_s4: "IV. Galactic Plane, Space Streaks & Volatiles",
    toc_s5: "V. Capability Synthesis Hypergraph",
    toc_s5b: "V-B. Multi-Archive Expansion & Audit Outcome",
    toc_s6_gal: "VI. GPU+CPU Infra & Milky Way Context",
    toc_s6: "VII. Audited Discovery Ledger",

    stat_lbl_new: "Audited survivors",
    stat_lbl_tnos: "Surviving TNOs",
    stat_lbl_gold: "Short-arc asteroids",
    stat_lbl_baseline: "L2×CTIO Baseline",
    stat_lbl_papers: "Method Graph",

    click_zoom: "Click to enlarge",
    lightbox_close: "Close [Esc] ✕",

    s1_kicker: "Section I · Detection Physics",
    s1_title: "Sky-Plane Motion Across Four Orders of Magnitude in Angular Speed",
    s1_p1:
      "Earth's orbital velocity imposes an inverse-distance reflex drift on every distant Solar System body near opposition, while inner-system planetesimals sweep across spaceborne focal planes within single exposures. Standard tracklet algorithms pair intra-night visits before linking across nights. Beyond the Kuiper cliff, apparent sky motion drops near three arcseconds per hour, shrinking intra-night displacement toward the atmospheric seeing width and stranding trans-Neptunian detections as unassociated single-visit points. Inside crowded Milky Way fields, background stars outnumber moving planetesimals by five orders of magnitude, whereas on the sharp silicon detectors of ESA Euclid at the Sun–Earth <math><msub><mi mathvariant=\"normal\">L</mi><mn>2</mn></msub></math> point, fast-moving asteroids trail across dozens of tenth-arcsecond pixels and mimic grazing cosmic rays.",
    s1_p2:
      "Recovering bodies across all three regimes requires matching the search operator to the physical motion scale. On Vera C. Rubin Observatory commissioning exposures, forming the hybrid union of unlinked difference detections and isolated single-visit point-spread-function sources restores transits dropped by kernel noise in blue and far-red passbands:",
    eq_union_name: "the hybrid source union",
    s1_p3:
      "Conditioning the hybrid source union on trial barycentric inverse distance and radial velocity removes topocentric reflex motion from every visit, collapsing multi-month transits onto linear tangent-plane trajectories without intra-night pairing. Compare the resulting multi-epoch sky motion in Figure 1 and inspect the measured astrometric coordinates of <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_003\">DELTA_003 ↗</a>, <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"EPS_002\">EPS_002 ↗</a>, and the Euclid recovery control <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge emerald js-3d-link\" data-fly-focus=\"EUCLID_EES149_GOLD_18\">2019 UM31 ↗</a> in the interactive comparator below.",

    gif1_fb_title: "Multi-Epoch Sky Blink Sequence (anim1_blink_where_is_it.gif)",
    gif1_fb_sub: "Background Gaia stars remain stationary across epochs while the Solar System planetesimal steps along its parallax loop. Step through the measured epochs in the schematic comparator below.",
    fig1_cap:
      "<strong>Figure 1 (schematic animation).</strong> Multi-epoch sky-plane blink sequence contrasting stationary field stars against a moving trans-Neptunian target. Fixed sidereal sources hold constant right ascension and declination across visits, whereas the Solar System body advances westward near opposition before curving toward its eastern-quadrature turnaround.",

    w1_kicker: "Interactive Schematic · Measured Astrometry, Illustrative Star Field",
    w1_title: "Blink Comparator: Locate the Moving Body Across Measured Survey Epochs",
    w1_t_d003: "DELTA_003 (51.15 AU eTNO candidate)",
    w1_t_eps002: "EPS_002 (Galactic-plane TNO candidate)",
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

    s2_kicker: "Section II · Extreme Orbital Mechanics",
    s2_title: "Quadrature Sightline Rotation and the Four-Planet Inclination Floor",
    s2_p1:
      'Why do short opposition arcs leave distant semimajor axes unconstrained, and how does full-season tracking break that degeneracy on <a href="#" target="_blank" rel="noopener" class="fly-badge copper js-3d-link" data-fly-focus="DELTA_003">DELTA_003 (LSST-DP2-D03) ↗</a>? Near opposition, Earth\'s gravitational acceleration bends the sky trajectory inversely with barycentric distance <math><mi>r</mi></math>, separating <math><mi>r</mi></math> from transverse speed <math><msub><mi>v</mi><mo>⊥</mo></msub></math> while radial speed <math><mover><mi>r</mi><mo>˙</mo></mover></math> projects along the sightline. Measuring speeds in units of the local circular speed <math><mrow><msub><mi>v</mi><mi>circ</mi></msub><mo>≡</mo><msqrt><mrow><mi>μ</mi><mo>/</mo><mi>r</mi></mrow></msqrt></mrow></math>, where <math><mi>μ</mi></math> is the Solar System barycentric gravitational parameter, defines the transverse kinetic parameter <math><mrow><mi>κ</mi><mo>≡</mo><msup><mrow><mo>(</mo><msub><mi>v</mi><mo>⊥</mo></msub><mo>/</mo><msub><mi>v</mi><mi>circ</mi></msub><mo>)</mo></mrow><mn>2</mn></msup></mrow></math> and dimensionless radial speed <math><mrow><mi>η</mi><mo>≡</mo><mover><mi>r</mi><mo>˙</mo></mover><mo>/</mo><msub><mi>v</mi><mi>circ</mi></msub></mrow></math>. Vis-viva energy and specific angular momentum fix semimajor axis <math><mi>a</mi></math> and eccentricity <math><mi>e</mi></math> along two exact kinematic relations:',
    eq_locus_name: "the turning-point locus & eccentricity-excess relation",
    s2_p2:
      "Super-circular transverse speed (<math><mrow><mn>1</mn><mo>&lt;</mo><mi>κ</mi><mo>&lt;</mo><mn>2</mn></mrow></math>) excludes every classical-belt aphelion interloper (<math><mrow><mi>a</mi><mo>≤</mo><mi>r</mi></mrow></math>). Over a brief opposition window, <math><mi>η</mi></math> enters sky coordinates only at second order, stretching the orbit solution from the radial turning point <math><mrow><mi>η</mi><mo>=</mo><mn>0</mn></mrow></math> out to high eccentricity (Figure 2). Recovering four additional single-visit and difference detections through eastern quadrature rotates Earth's sightline against the radial vector. Outbound radial displacement projects directly onto right ascension, pinning <math><mrow><mi>η</mi><mo>&gt;</mo><mn>0</mn></mrow></math> and collapsing <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_003\">DELTA_003 ↗</a> onto an outbound extreme trans-Neptunian orbit whose fitted semimajor axis lies near Neptune's twelve-to-one mean-motion resonance (Figures 3 and 4).",
    s2_p3:
      'Across the multi-opposition Solar System census, extreme orbits vacate the ecliptic plane once perihelion <math><mi>q</mi></math> detaches from Neptune\'s semimajor axis <math><msub><mi>a</mi><mi mathvariant="normal">N</mi></msub></math>. Close scattering off circular Neptune restricts Tisserand\'s invariant <math><msub><mi>T</mi><mi mathvariant="normal">N</mi></msub></math> at or below three, while subsequent perihelion lifting inside axisymmetric exterior resonances conserves the normalized vertical angular momentum <math><mrow><msub><mi>J</mi><mi>z</mi></msub><mo>≡</mo><msqrt><mrow><mn>1</mn><mo>−</mo><msup><mi>e</mi><mn>2</mn></msup></mrow></msqrt><mi>cos</mi><mo>⁡</mo><mi>i</mi></mrow></math>. Combining both invariants imposes an analytic upper bound on <math><mrow><mi>cos</mi><mo>⁡</mo><mi>i</mi></mrow></math>:',
    eq_floor_name: "the Tisserand–Kozai inclination floor",
    s2_p4:
      "On its fitted orbit <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_003\">DELTA_003 ↗</a> would lie more than eleven degrees below the Tisserand–Kozai inclination floor. The independent audit retains the object and its fitted elements as plausible and in need of follow-up, rejects the earlier claim that it has the lowest inclination among known extreme orbits, and grades the Tisserand-parameter and resonance-sticking interpretations as disputed, so the dynamical reading in Figure 5 is provisional. Companion ecliptic candidates <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_004\">DELTA_004 ↗</a>, <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_009\">DELTA_009 ↗</a>, and <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_014\">DELTA_014 ↗</a> extend this blind parallax yield across the Capricornus–Aquarius ecliptic strip; for DELTA_009 the audit verifies a 2022 DECam precovery and the fitted semimajor axis.",

    gif2_fb_title: "Double-Cone Range-Rate Search & Quadrature Collapse (anim2_double_cone_quadrature_collapse.gif)",
    gif2_fb_sub: "Eastern-quadrature sightline rotation collapses the one-dimensional opposition turning-point locus onto the outbound extreme orbit beside Neptune's 12:1 resonance.",
    fig2_cap:
      "<strong>Figure 2 (schematic animation).</strong> Evolution of the barycentric orbit posterior from short-arc opposition parallax to full-season quadrature lock. Sightline rotation projects outbound radial velocity onto sky longitude and collapses the turning-point curve onto an extreme trans-Neptunian ellipse.",
    fig3_cap:
      "<strong>Figure 3.</strong> Sky reflex loop across four optical bands, off-epoch forced difference flux, and broadband flux limits with an ALMA thermal prediction for LSST-DP2-D03 (Section VII ledger).",
    fig4_cap:
      "<strong>Figure 4.</strong> Collapse of the opposition turning-point locus onto Neptune's twelve-to-one resonance in semimajor axis versus perihelion, alongside the Tisserand–Kozai inclination floor across known extreme bodies.",
    fig5_cap:
      "<strong>Figure 5.</strong> Forward symplectic orbital evolution across the quadrature posterior showing fractional semimajor-axis diffusion, adiabatic perihelion conservation, and exterior mean-motion resonance sticking.",

    s3_kicker: "Section III · Instantaneous Space–Ground Triangulation",
    s3_title: "Simultaneous Stereoscopic Parallax Across the Sun–Earth Lagrange Baseline",
    s3_p1:
      'Single-station surveys wait weeks for Earth\'s orbital motion to build a parallax baseline, leaving faint outer-system discoveries vulnerable to lunar-phase gaps and twilight loss. Observing a field simultaneously from ESA Euclid in halo orbit around the Sun–Earth <math><msub><mi mathvariant="normal">L</mi><mn>2</mn></msub></math> point (station <code>273</code>) and the Blanco four-meter Dark Energy Camera at Cerro Tololo in Chile (station <code>W84</code>) creates a rigid instantaneous space–ground baseline <math><msub><mi mathvariant="bold">B</mi><mrow><mi mathvariant="normal">L2</mi><mo>−</mo><mi mathvariant="normal">W84</mi></mrow></msub></math> exceeding four lunar distances. Projecting that baseline perpendicular to the target sightline <math><mover><mi mathvariant="bold">n</mi><mo>^</mo></mover></math> yields the topocentric range directly from a single simultaneous epoch:',
    eq_stereo_name: "the stereoscopic parallax relation",
    s3_p2:
      "Cross-matching Euclid Ecliptic Survey exposures against simultaneous Cerro Tololo stacks yields DECam counterparts along the <math><mrow><mi mathvariant=\"normal\">L</mi><mn>2</mn><mo>→</mo><mi mathvariant=\"normal\">W84</mi></mrow></math> epipolar ray for two uncatalogued trans-Neptunian candidates, <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUC0005\">EUC0005 ↗</a> and <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUC0002\">EUC0002 ↗</a> (Figures 6 and 7). The independent audit verifies both Euclid detections on VIS pixels and reproduces the DECam signals, which are not static sources and carry an empirical chance probability of about one to two percent each. It grades the pair as plausible candidates in need of follow-up and does not support the quoted significances, the model-generated ground astrometry, or the fitted orbits; the stereoscopic distances hold if the matches are real. Drag the observer baseline slider below from Chile out to Sun–Earth <math><msub><mi mathvariant=\"normal\">L</mi><mn>2</mn></msub></math> to see the stereoscopic shift.",

    gif3_fb_title: "1.685M-km L2 × Chile Stereoscopic Parallax (anim3_l2_stereoscopic_parallax.gif)",
    gif3_fb_sub: "Simultaneous sightlines from CTIO (W84) and ESA Euclid at L2 (273) displace EUC0005 by 64.19 arcsec along the epipolar vector.",
    fig6_cap:
      "<strong>Figure 6 (schematic animation).</strong> Geometric triangulation between Cerro Tololo on Earth and ESA Euclid at Sun–Earth L2. Distant background stars remain unshifted while trans-Neptunian targets shift by about one arcminute along the baseline vector.",
    fig7_cap:
      "<strong>Figure 7.</strong> Archival stamps (upper panel of each pair) and same-sky comparisons (lower panel) in fourteen panels at the positions of the distant candidates and three asteroid-field targets, from Dark Energy Camera and Euclid VIS single exposures, labelled with date, band, and aperture signal-to-noise ratio. The final pair is the trailed image of the catalogued asteroid 2019 UM31, the recovery control. North is up and east is left. Plate from the audited manuscript.",

    w2_kicker: "Interactive 1.685-Million-km Baseline Triangulator",
    w2_title: "Stereoscopic Parallax Slider: CTIO Chile (Earth) ↔ ESA Euclid (Sun–Earth L2)",
    w2_t_euc5: "EUC0005 (64.19″ shift · 35.60 AU if matched)",
    w2_t_euc2: "EUC0002 (66.47″ shift · 34.40 AU if matched)",
    w2_btn_earth: "CTIO Chile (0 km)",
    w2_btn_l2: "Euclid L2 (1.685M km)",
    w2_sweep_on: "Auto-Sweep: ON",
    w2_sweep_off: "Auto-Sweep: OFF",
    w2_slider_lbl: "Observer Position Along Space–Ground Baseline:",
    tel_baseline: "Baseline:",
    tel_shift: "Apparent Shift:",
    tel_range: "Triangulated Range:",
    tel_bound: "Kinetic Bound:",

    s4_kicker: "Section IV · Crowded Fields, Short-Arc Trails & Coma Spectroscopy",
    s4_title: "Galactic-Plane Candidates, Euclid Silicon Trails, and Spaceborne Coma Spectra",
    s4_sub1: "A. Piercing the Milky Way Aphelion Blind Spot",
    s4_p1:
      "Outer-Solar-System surveys routinely mask low Galactic latitudes where Sagittarius and Ophiuchus star clouds intersect the ecliptic—precisely the sky zone where distant aphelion orbits cross the Milky Way. Applying difference imaging paired with off-epoch forced-photometry vetoes across this crowded corridor isolates two bright uncatalogued trans-Neptunian candidates: <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"EPS_002\">EPS_002 ↗</a> seven degrees above the Galactic midplane and <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"EPS_007\">EPS_007 ↗</a> south of the bulge (Figures 8 and 9). The independent audit grades both as plausible and in need of follow-up, and it disputes the dwarf-planet size once proposed for EPS_002. In the two archival DECam frames of 2024 April 18 the aperture signal-to-noise ratio at the position of EPS_002 is 2.1 and 2.8 in a crowded field, too low to establish the object on those pixels alone.",
    gif4_fb_title: "Galactic-Plane Blind Spot Recovery: EPS_002 (anim4_galactic_blindspot_eps002.gif)",
    gif4_fb_sub: "Difference-imaging subtraction cancels dense Sagittarius–Ophiuchus stellar crowding at b = +7.1°, isolating the trans-Neptunian candidate EPS_002.",
    fig8_cap:
      "<strong>Figure 8 (schematic animation).</strong> Recovery of the trans-Neptunian candidate EPS_002 inside the low-latitude Milky Way crossing zone via difference imaging and forced-photometry static-star rejection.",
    fig9_cap:
      "<strong>Figure 9.</strong> Fitted orbits of the candidates and a shape test for binaries. (a) Perihelion against semimajor axis by search, with Neptune's perihelion line and resonances; open squares are Euclid candidates at nominal values that their short arcs do not fix. (b) Inclination against perihelion for published bodies beyond 150 au and R25-D03 at <math><mi>i</mi><mo>=</mo><mn>3.16</mn><mo>°</mo></math>; the curve marks a Tisserand parameter of three. (c) Sky-frame quadrupole moments of 2025 NW189, per visit and stacked, with 2025 NU192 and catalogued wide binaries, against single-object controls; the audit grades the NW189 binary claim as disputed and the NU192 claim as unsupported. Plate from the audited manuscript.",

    s4_sub2: "B. Short-Arc Asteroid Trails and Faint Trans-Neptunian Candidates on Euclid Silicon",
    s4_p2:
      "On ESA Euclid's visible imager, bright moving streaks trigger onboard cosmic-ray flags (<code>0x10</code>) while twelve thousand low-Earth constellations and sixteen <math><msub><mi mathvariant=\"normal\">L</mi><mn>2</mn></msub></math> spacecraft cross wide survey sightlines. Restoring flagged optical cores whose cross-track profile matches Euclid's Korsch point-spread function, linking visible and near-infrared dithers under full <math><msub><mi mathvariant=\"normal\">L</mi><mn>2</mn></msub></math> light-time geometry, and vetoing live two-line-element satellite propagations yields {{euclid_tnos}} Euclid trans-Neptunian candidates that survive the independent audit—two with single-night DECam stereo counterparts (<a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUC0005\">EUC0005 ↗</a> and <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUC0002\">EUC0002 ↗</a>) and two slow movers in the same ecliptic block (<a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUCLID_VIS_TNO_02\">EUCLID_VIS_TNO_02 ↗</a> and <code>EUCLID_VIS_TNO_03</code>) whose distances the audit finds unconstrained—alongside {{asteroids}} short-arc asteroid candidates, {{ees_asteroids}} of them seen in both VIS and NISP (Figures 10 and 11). Arcs shorter than a day give sky motion and brightness; they give no orbit, size, or taxonomic class. One more dual-instrument track, <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge emerald js-3d-link\" data-fly-focus=\"EUCLID_EES149_GOLD_18\">EUCLID_EES149_GOLD_18 ↗</a>, is the catalogued main-belt asteroid 2019 UM31: it was never a near-Earth object and now serves as the Euclid VIS recovery control.",
    fig10_cap:
      "<strong>Figure 10.</strong> Euclid VIS single exposures of asteroid candidates EUC-G26 to EUC-G32, the COSMOS candidates EUC-J01, EUC-J02, and EUC-M01 to EUC-M03, and the deep-field candidates, each above a comparison of the same sky at other epochs. The last pair shows the trailed image of the catalogued asteroid 2019 UM31, the recovery control. Plate from the audited manuscript.",
    fig11_cap:
      "<strong>Figure 11.</strong> Archival pixels at the positions of the distant candidates. Top row, Dark Energy Camera exposures at the positions of R25-E02, R25-D09, EUC-S05, EUC-S02, and EUC-CW04. Lower rows, Euclid VIS single exposures of the {{euclid_tnos}} trans-Neptunian candidates, down to <math><msub><mi>I</mi><mi mathvariant=\"normal\">E</mi></msub><mo>=</mo><mn>25.4</mn></math>. Each stamp sits above a comparison of the same sky at other epochs; solid cross-hairs mark the expected position at the epoch shown and dashed cross-hairs the same position at other epochs. North is up and east is left. Plate from the audited manuscript.",

    s4_sub3: "C. Transient-Preserving Infrared Coma Spectra",
    s4_p3:
      "Ground-based spectroscopy cannot penetrate telluric carbon-monoxide and carbon-dioxide absorption bands, while NASA SPHEREx's static-sky pipeline flags moving Solar System targets as transient outliers (<code>bit 19</code>). Streaming byte-range cutouts that retain <code>bit 19</code> moving flux while rejecting blended background stars (<code>bit 21</code>) under low-Earth-orbit spacecraft parallax yields coma spectra of interstellar visitor <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"ATLAS_3I\">3I/ATLAS ↗</a> and active Centaur <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"SW1_29P\">29P/Schwassmann–Wachmann 1 ↗</a> (Figures 12 and 13). The independent audit confirms carbon-monoxide and <sup>12</sup>CO<sub>2</sub> emission in 3I/ATLAS and carbon-monoxide emission in 29P; it does not support the <sup>13</sup>CO<sub>2</sub> and water-ice detections reported in earlier versions of this page. Figure 14 places every regime from the main asteroid belt, where the recovery control <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge emerald js-3d-link\" data-fly-focus=\"EUCLID_EES149_GOLD_18\">2019 UM31 ↗</a> orbits, out to the inner Oort Cloud (<a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-cat=\"oort_cloud\">3D Oort Cloud View ↗</a>) onto a single logarithmic scale.",
    fig12_cap:
      "<strong>Figure 12 (pre-audit figure).</strong> Rubin recovery of the hyperbolic trajectory of interstellar comet 3I/ATLAS and its SPHEREx linear-variable-filter coma spectrum. The audit confirms the carbon-monoxide and carbon-dioxide emission; the water-ice absorption marked in the figure is not supported.",
    fig13_cap:
      "<strong>Figure 13.</strong> Spectra and spectral energy distributions from archive joins. (a) SPHEREx spectra of comet 3I/ATLAS, Centaur 29P/Schwassmann–Wachmann 1, and asteroid (492) Gismonda, with Euclid photometry of 2015 BP519, scaled and offset; dashed lines mark water, carbon-dioxide, and carbon-monoxide bands. (b) Thermal fluxes of (87) Sylvia with a thermal-model curve and a published ALMA point; diamonds are Euclid fluxes of (6493) Cathybennett. (c) Archival fluxes at a published far-infrared planet candidate with schematic curves, a radio flux for a second candidate, and upper limits for R25-D03. Plate from the audited manuscript.",
    gif5_fb_title: "Logarithmic Scale Zoom: Inner System to Oort Cloud (anim5_solar_to_oort_zoom.gif)",
    gif5_fb_sub: "Continuous radial zoom from the inner Solar System across the Main Belt, Centaurs, Kuiper Belt, and DELTA_003 (277 AU aphelion on its fitted orbit) to the Oort Cloud.",
    fig14_cap:
      "<strong>Figure 14 (schematic animation).</strong> Radial architecture spanning five orders of magnitude in heliocentric distance from main-belt asteroids and active Centaurs to extreme trans-Neptunian ellipses and Oort-cloud comets.",

    s5_kicker: "Section V · Methodological Synthesis",
    s5_title: "Capability Decomposition and Multi-Telescope Synthesis Hypergraph",
    s5_p1:
      "Each individual astronomical archive discards moving bodies where its native reduction assumes stationary sources or rapid intra-night motion. Constructing the discovery system began by indexing published Solar System linking, shift-and-stack, stereoscopy, and transient-masking papers inside a hybrid property-and-vector database (<code>MethodGraphVectorDB</code>), mapping twelve survey failure modes directly onto mathematical operators extracted from distinct observational traditions.",
    s5_p2:
      "Four coupled synthesis hyperedges unite those decomposed capabilities into a single search engine (Figure 15). Select any node or hyperedge in the diagram below to trace how literature failure-mode diagnostics combine spaceborne astrometry, ground difference imaging, Lagrange-point stereoscopy, and infrared spectroscopy into candidates that an independent audit then grades.",

    hg_col1: "FAILURE DIAGNOSIS",
    hg_col2: "DECOMPOSED SURVEY ENGINES",
    hg_col3: "SYNTHESIS HYPEREDGES",
    hg_col4: "AUDITED YIELD",
    hg_mg_l1: "30 arXiv Papers · 79 Nodes",
    hg_mg_l2: "384 Edges · 12 Failure Modes",
    hg_mg_l3: "• Intra-night tracklet drop-out",
    hg_mg_l4: "• 0x10 streak & bit-19 clipping",
    hg_mg_l5: "• Opposition η degeneracy",
    hg_e1_t: "Vera C. Rubin DP2 (Station X05)",
    hg_e1_s1: "-O3 C Double-Cone BK (γ, γ̇) Sniper",
    hg_e1_s2: "DiaSource ∪ Orphan Source + ForcedPhot",
    hg_e1_s3: "REBOUND IAS15 / WHFast (DE441)",
    hg_e2_t: "ESA Euclid DR1 @ Sun–Earth L2",
    hg_e2_s1: "0.10″/px VIS Streaks (0x10 Core Guard)",
    hg_e2_s2: "NISP Y_E/J_E/H_E + @-680 SPICE",
    hg_e2_s3: "Simultaneous CTIO DECam (W84) Pairing",
    hg_e3_t: "Spacecraft & Static-Sky Veto Engine",
    hg_e3_s1: "SGP4 11,899 Starlink/TLE + 16 L2 Probes",
    hg_e3_s2: "Gaia DR3 · CatWISE · ASKAP 888 MHz",
    hg_e3_s3: "2000–2024 DECam / CFHT / PS1 Stacks",
    hg_e4_t: "NASA SPHEREx S3 + ESO ALMA",
    hg_e4_s1: "0.75–5.00 µm Pure-RAM HTTP Range",
    hg_e4_s2: "bit-19 Transient Kept · bit-21 Vetoed",
    hg_e4_s3: "LEO Parallax + ALMA Band 6/7 Continuum",
    hg_h1_t: "Quadrature & Milky Way Locker",
    hg_h1_s1: "124.8 d Arc Extension (η > 0)",
    hg_h1_s2: "Static-Sky Veto on Other Epochs",
    hg_h2_t: "1.685M-km 3D Triangulator",
    hg_h2_s1: "L2 (273) × DECam (W84) Epipolar",
    hg_h2_s2: "Single-Night Stereo Range",
    hg_h3_t: "Multi-ROS L2 Keplerian Linker",
    hg_h3_s1: "VIS+NISP 4-Band Photometry",
    hg_h3_s2: "Satellite-Propagation Veto",
    hg_h4_t: "Volatile & Radiometric Synthesizer",
    hg_h4_s1: "CO / 12CO2 Emission Bands",
    hg_h4_s2: "NEATM + 870 µm Flux Bounds",
    hg_y1_s1: "DELTA_003: fitted a = 156.6 AU",
    hg_y1_s2: "EPS_002 (Galactic plane)",
    hg_y2_s1: "2 Stereo Candidates (Plausible)",
    hg_y2_s2: "3 Verified in COSMOS",
    hg_y3_s1: "Control: 2019 UM31",
    hg_y3_s2: "Arcs < 1 day · orbits open",
    hg_y4_s1: "CO + 12CO2 confirmed",
    hg_y4_s2: "13CO2 / H2O unsupported",
    hg_fly_all: "Open Yield in 3D Explorer ↗",
    fig15_cap:
      "<strong>Figure 15.</strong> Capability decomposition and synthesis hypergraph of the multi-telescope discovery system. Directed curves trace how literature failure-mode diagnostics combine decomposed archive operators across four synthesis hyperedges (dashed enclosures) into the candidate yield. After the independent audit that yield stands at {{survivors}} surviving candidates out of {{claims}} claims, together with confirmed coma emission bands.",

    s6_kicker: "Section VII · Observational & Orbital Ledger",
    s5b_kicker: "Section V-B · Multi-Archive Expansion and Independent Audit",
    s5b_title: "From {{claims}} Claims to {{survivors}} Audited Candidates: Tracklet-Archive Links, Jovian Satellite Candidates, and What Was Removed",
    s5b_p1: "Scaling the architecture across more than a dozen space and ground archives—coupling a GPU-accelerated fourth-order Keplerian effective-time linker across the 9.05-million-row Minor Planet Center Isolated Tracklet File, deep sub-threshold shift-and-stack, sky-rotated quadrupole shape tests, and planetocentric Hill-sphere satellite linking—raised the number of Solar System claims to {{claims}}. The independent audit retains {{survivors}}: {{group1_tnos}} trans-Neptunian candidates from Rubin and the tracklet archive, {{euclid_tnos}} Euclid trans-Neptunian candidates, {{centaurs}} Centaur, {{moons}} candidate irregular satellites of Jupiter, and {{asteroids}} short-arc asteroid candidates. It matched {{catalogued}} claims to catalogued bodies, most of them main-belt asteroids, eliminated {{eliminated}}, and left {{disputed}} in dispute. Figures 16–18 were drawn before the audit and are kept for the record with corrected captions; the real-pixel movie gallery replaces the stamp mosaic that used to open this section, whose discovery stamps were rendered and not observed.",
    fig16_cap: "<strong>Figure 16 (pre-audit figure).</strong> Top-down ecliptic (panel a) and edge-on vertical structure (panel b) of the outer Solar System orbits claimed before the audit, including <code>W3A_ITF_010</code> (a = 224.9 au), which the audit eliminated. The fitted orbits of the surviving candidates remain provisional.",
    fig17_cap: "<strong>Figure 17 (pre-audit figure).</strong> Planetocentric orbital elements relative to known Jovian satellite families (panel a), sky-plane trajectories relative to Jupiter (panel b), and astrometric residuals (panel c) for four Jovian satellite claims. The audit retains <code>W4_JUP_MOON_GOLD_001</code> to <code>003</code> as plausible candidates, eliminates <code>W4_JUP_MOON_GOLD_004</code>, and disputes the family assignments.",
    fig18_cap: "<strong>Figure 18 (pre-audit figure).</strong> Census drawn from the full claim list as it stood before the independent audit: barycentric semimajor axis versus perihelion (panel a), inferred diameter versus distance with Rubin and JWST sensitivity curves (panel b), sky positions (panel c), and astrometric RMS distribution (panel d). The audit retains {{survivors}} of {{claims}} claims; the axis label “Verified objects” in panel d predates it.",
    fig19_cap: "<strong>Figure 19 (pre-audit figure).</strong> Galactocentric spiral-arm architecture and compact-object benchmarks (panel a), astrometric mass ratio versus orbital period highlighting the Euclid Deep Field South candidate <code>Gaia DR3 4829790543688453504</code> above the Class III threshold (panel b), and normalized wide-binary speed versus separation showing sub-3.6-arcsecond Rubin neighbors around high-speed pairs (panel c). The audit grades the dark-remnant reading of panel b and the anomalies of panel c as disputed.",
    s6g_kicker: "Section VI · Unified GPU+CPU Architecture & Galactic Context",
    s6g_title: "From the Oort Cloud to Milky Way Compact Binaries Across Gaia, Euclid, and Rubin",
    s6g_p1: "The same multi-archive principles that isolate slow planetesimals beyond Neptune extend naturally across Galactic scales. Inside our self-contained <code>astro_search</code> framework, every numerical kernel—symplectic Wisdom–Holman Solar System propagation (285× GPU speedup over multi-core CPU), axisymmetric Milky Way potential integration (<code>MWPotential</code>, 565× GPU speedup across 1.62 million Monte Carlo trajectories), Thiele–Innes astrometric orbital inversion, near-infrared spectral energy distribution vetoes, wide-binary pairwise matching (86× GPU speedup), and ellipsoidal periodograms (88× GPU speedup)—executes with numerical parity across GPU arrays and CPU fallbacks that the independent audit verified, backed by a normalized catalog of thirty-eight Solar System, Oort Cloud, and Galactic search methods.",
    s6g_p2: "Applying this four-archive pipeline across Gaia DR3, ESA Euclid DR1, Vera C. Rubin Data Preview 2, and SIMBAD blindly recovers the benchmark neutron-star binary <code>Gaia NS1</code> and the known unbound star <code>UCAC4 656-058031</code>, both verified by the independent audit, and cross-matches 188 high-RUWE stars to Rubin <code>dp2</code> (including 138 multi-epoch <code>DiaObject</code> variables). The audit grades the dark-remnant interpretation of the Euclid Deep Field South astrometric binary <code>Gaia DR3 4829790543688453504</code> (panel b of Figure 19) and the nine wide-binary velocity anomalies (panel c) as disputed, and it does not support the earlier claim of a new escape-boundary halo giant. Explore all 82,199 Gaia DR3 stars and relativistic accretion-disk and lensing models for <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"SGR_A_STAR\">Sagittarius A* ↗</a>, <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"GAIA_BH1\">Gaia BH1–BH3 ↗</a>, and <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"CYGNUS_X1\">Cygnus X-1 ↗</a> in the 3D Explorer and <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-playground=\"1\">Interactive 3D Playground ↗</a>.",
    s6_title: "Audited Ledger: {{ledger_survivors}} Surviving Candidates, {{ledger_disputed}} Disputed Claims, {{ledger_known}} Known Objects and Controls, and {{ledger_volatile}} Spectral Targets",
    s6_p1:
      "Every claim made before the audit that remains in the catalogue is listed below with its audit status, followed by the SPHEREx spectral targets. Only rows marked <strong>audited survivor</strong> count as discovery candidates; disputed claims, catalogued objects, and the recovery controls are shown for transparency and are never counted. Sky coordinates, epochs, magnitudes, heliocentric distances, and elements (<math><mrow><mi>a</mi><mo>,</mo><mi>q</mi><mo>,</mo><mi>e</mi><mo>,</mo><mi>i</mi><mo>,</mo><mi>ϖ</mi><mo>,</mo><msub><mi>T</mi><mi mathvariant=\"normal\">N</mi></msub></mrow></math>) are listed as measured or fitted by the search, and the note under each row quotes the audit. Click a column header to sort, filter by population or audit status, or open the 3D explorer on a body's orbit.",

    lf_all: "All populations",
    lf_etno: "Rubin & tracklet-archive TNOs / Centaur",
    lf_stereo: "Euclid trans-Neptunian rows",
    lf_moon_bin: "Jovian moon candidates",
    lf_gold: "Inner Solar System rows",
    lf_vol: "SPHEREx spectral targets",
    ledger_search_ph: "Search ID, designation, audit status, or facility...",
    th_obj: "Designation · Audit Status",
    th_fac: "Facility / Span",
    th_coord: "ICRS (α, δ)",
    th_mag: "Mag / H",
    th_r: "r (AU)",
    th_size: "Size / Bands · Audit Note",
    th_3d: "3D Orbit",
    fly_row_btn: "3D ↗",

    hero_cta_gallery: "{{movie_targets}}-Target Real-Pixel Movie Gallery ↗",
    nav_hub: "Portal Hub",
    nav_gallery: "Movie Gallery",
    toc_audit: "Audit Status & Real Pixels",
    stat_lbl_claims: "Pre-audit claims",
    stat_lbl_disputed: "Disputed (uncounted)",
    stat_lbl_catalogued: "Catalogued matches",
    stat_lbl_eliminated: "Eliminated",
    stat_lbl_moons: "Jovian moon candidates",
    stat_lbl_movies: "Real-pixel movie targets",
    stat_lbl_frames: "Real archival frames",
    stat_lbl_stars: "Gaia 3D stars (explorer)",
    audit_kicker: "Independent Audit · Read This First",
    audit_title: "What the Independent Audit Retained, Disputed, and Removed",
    audit_p1: "After the searches closed, a second set of agents working from a read-only copy of the project regraded every claim from its own archive queries, orbit fits, and archival pixels. Of <strong>{{claims}}</strong> Solar System claims made before the audit, <strong>{{survivors}}</strong> survive as candidates for follow-up ({{per_object}} graded object by object and {{per_claim}} through group-level existence checks; {{verified}} graded verified and {{plausible}} plausible). <strong>{{catalogued}}</strong> were matched to previously catalogued bodies, <strong>{{eliminated}}</strong> were eliminated, and <strong>{{disputed}}</strong> remain disputed and are not counted. Every surviving body is a candidate that awaits a Minor Planet Center designation and independent recovery.",
    audit_p2: "<strong>Corrections to earlier versions of this page.</strong> <code>EUCLID_EES149_GOLD_18</code> (paper id EUC-G18), once described here as a 111-metre near-Earth asteroid, is the catalogued main-belt asteroid <strong>2019 UM31</strong> (a = 2.60 au, e = 0.31, i = 7.05°, H = 19.3). A joint fit of its 2019 Minor Planet Center astrometry with the Euclid detections ties the two. It was never a near-Earth object, and it now serves as the Euclid VIS recovery control beside the Rubin control <strong>2021 QB98</strong>. The tracklet-archive link <code>W3A_ITF_010</code> (a = 224.9 au), one further Rubin claim, one of four Jovian satellite claims, and three Euclid deep-field rows were eliminated. The wide-binary claim for 2025 NU192 is unsupported and the claim for 2025 NW189 is disputed. Asteroid candidates with arcs shorter than a day have no determined orbit, size, or taxonomic class. For the two Euclid × DECam stereo candidates the audit verifies the Euclid detections and reproduces the DECam signals, yet it does not support the quoted significances or the fitted orbits. In the SPHEREx spectra it confirms CO and <sup>12</sup>CO<sub>2</sub> emission in 3I/ATLAS and CO emission in 29P, and it does not support the <sup>13</sup>CO<sub>2</sub> and water-ice detections.",
    audit_p3: "<strong>Real pixels.</strong> The <a href=\"../movie_gallery/index.html\">movie gallery</a> holds archival image sequences for <strong>{{movie_targets}}</strong> targets: {{movie_discovery_targets}} discovery targets and the {{movie_controls}} recovery controls, in <strong>{{movie_frames}}</strong> real archival frames of which {{movie_single}} are single exposures, with <strong>{{movie_synthetic}}</strong> synthetic frames and {{movie_gaps}} coverage gaps. For {{movie_no_epoch}} of them (eleven Group I targets and the 2021 QB98 control) the archive serves only static deep coadds, so no detection-epoch pixels are shown. The animations and interactive canvases on this page are schematic illustrations driven by measured astrometry and contain no archival pixels. Figures 7, 9, 10, 11, and 13 are plates from the audited manuscript.",
    audit_link_gallery: "{{movie_targets}}-Target Movie Gallery",
    audit_link_ms: "Audited Manuscript (PDF)",
    audit_link_verdicts: "Audit Verdict Ledgers (JSON)",
    hg_y1_t: "{{group1_tnos}} TNO Candidates",
    hg_y2_t: "{{euclid_tnos}} Euclid TNO Candidates",
    hg_y3_t: "{{asteroids}} Asteroid Candidates",
    hg_y4_t: "3I/ATLAS & 29P/SW1",
    realpix_note: "<strong>Real archival pixels.</strong> Single exposures, static references, and difference panels where the archive provides them are in the movie gallery: <a href=\"../movie_gallery/index.html?group=group1\">Group I (Rubin and DECam)</a>, <a href=\"../movie_gallery/index.html?group=group2\">Group II (Euclid trans-Neptunian candidates)</a>, <a href=\"../movie_gallery/index.html?group=group5\">Group V (Euclid asteroid candidates)</a>, <a href=\"../movie_gallery/index.html?group=galactic\">Galactic stars</a>, and the <a href=\"../movie_gallery/index.html?group=controls\">two recovery controls</a>.",
    s6g_p3: "The same joins isolate {{movie_galactic}} faint high-proper-motion stars below Gaia's flux limit: one white-dwarf candidate, two late-M or early-L dwarf candidates, seventeen ultracool-dwarf candidates, and five late-M dwarf candidates. The audit verifies the tally, the reality of the proper motions, and the absence of Gaia DR3 counterparts within nine arcseconds; it disputes the quoted proper-motion significances and the statement that all of them were previously uncatalogued. Archival Euclid, Legacy Surveys, and Rubin stamps for all {{movie_galactic}} are in the <a href=\"../movie_gallery/index.html?group=galactic\">Galactic section of the movie gallery</a>.",
    la_all: "All statuses",
    la_survivor: "Audited survivors",
    la_disputed: "Disputed / uncounted",
    la_known: "Known / control",
    la_volatile: "Volatile targets",
    st_survivor: "AUDITED SURVIVOR",
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
    orbit_open_tip: "The audit does not accept the tabulated orbit of this row",
    ledger_summary_fmt: "Showing {shown} of {total} rows · {{ledger_survivors}} audited survivors · {{ledger_disputed}} disputed (not counted) · {{ledger_known}} known or control · {{ledger_volatile}} spectral targets",
    ledger_legend: "<strong>†</strong> Orbit not established: the independent audit grades the tabulated elements of the row as disputed or unsupported, and for arcs shorter than a day the size is not determined either. Sizes elsewhere assume an albedo. The audit eliminated {{eliminated}} further claims ({{eliminated_list}}); they were dropped from the catalogue and have no row.",
    footer_hub: "Portal Hub",
    footer_gallery: "{{movie_targets}}-Target Movie Gallery",
    footer_left:
      "Data Credits: ESA Euclid DR1-Foundation (MPC 273, NASA/IPAC IRSA), Vera C. Rubin Observatory Data Preview 2 (MPC X05), NASA SPHEREx DR1+QR3, NOIRLab CTIO DECam (MPC W84), ESO ALMA, and JPL Horizons DE441.",
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
    cv_decam_note: "DECam 960 s r+i counterpart (plausible candidate)",
    cv_if_matched: "if the match is real"
  },

  zh: {
    doc_title: "多望远镜太阳系自动发现研究专论 — 盲视差搜索、日地 L2 立体三角测量与空间挥发物光谱",
    nav_journal: "研究专论",
    nav_title: "多望远镜智能体太阳系自动发现系统",
    nav_cta_3d: "进入 3D 太阳系探索器 ↗",
    theme_dark: "深色",
    theme_light: "浅色",

    hero_kicker: "多望远镜自动发现研究专论 · 太阳系至银河系全尺度",
    hero_title: "跨越太阳系的质心盲视差搜索、天地同步立体视差测量与瞬变保留空间光谱学",
    hero_authors: "多望远镜自动发现合作组",
    hero_affil: "{{claims}} 项审核前宣称中 {{survivors}} 项经独立审核保留 · {{movie_targets}} 个真实像素档案影像目标 · 模块化 GPU+CPU 搜索架构",

    abstract_heading: "摘要",
    abstract_body:
      "大视场光学与红外巡天记录了成千上万颗未编目的太阳系星子，其视运动特征往往超出单一望远镜管线的配对阈值。在柯伊伯悬崖以外，天体夜内角位移低于大气视宁度尺度，导致遥远天体退化为孤立的单次曝光源，且短弧冲日观测使视线方向的径向速度处于简并状态。在内太阳系中，高速运动的小行星在空间探测器上拉出细长条纹并触发宇宙线掩模；银道面密集恒星场掩盖了明亮的远距天体；静态天空异常值剔除算法则会抹去运动彗星的气体发射带。本研究通过结构化方法数据库拆解巡天失效机制，将鲁宾天文台差分与单次曝光星表的质心双锥视差连接、欧几里得空间望远镜与智利托洛洛山暗能量相机的日地拉格朗日二点同步立体测量、结合实时人造卫星轨道传播否决的空间条纹天体测量，以及美国宇航局全天红外光谱巡天的瞬变保留测光有机结合，在十余个公开档案中提出{{claims_words}}项太阳系新天体宣称。随后的独立审核重新执行档案查询、轨道拟合与像素测量，保留其中{{survivors_words}}项作为待后续观测确认的候选体：{{tnos_words}}颗海王星外天体、{{centaurs_words}}颗半人马天体、{{moons_words}}颗木星不规则卫星候选体与{{asteroids_words}}颗短弧小行星候选体；另有{{catalogued_words}}项被证认为已编目天体，{{eliminated_words}}项被剔除，{{disputed_words}}项存疑，均不计入新发现。本专论同步发布{{movie_targets_words}}个目标的真实档案像素影像，其中不含任何合成帧；同一审核确认了活跃半人马天体中的一氧化碳辐射以及星际彗星中的一氧化碳与二氧化碳辐射。进一步将该模块化 GPU 与 CPU 天体测量-测光联合框架拓展至 Gaia、Euclid 与 Rubin 交叉巡天，使搜索从外太阳系动力学延伸至银河系暗弱高自行恒星与致密双星候选体。",

    hero_cta_primary: "进入 3D 太阳系与银河系探索器 ↗",
    hero_cta_playground: "互动 3D 模型与黑洞实验室 ↗",
    hero_cta_discoveries: "在 3D 中检视 {{survivors}} 条经审核轨道 ↗",
    hero_cta_oort: "缩放至内奥尔特云全景 ↗",
    hero_quick_fly: "一键 3D 飞抵天体：",

    toc_title: "目录",
    toc_s1: "I. 天球视运动与闪烁盲搜发现",
    toc_s2: "II. 东大距轨道坍缩与倾角下限",
    toc_s3: "III. 日地 L2 × 地球同步立体视差",
    toc_s4: "IV. 银道面盲区、硅像素条纹与挥发物",
    toc_s5: "V. 能力拆解与多望远镜合成超图",
    toc_s5b: "V-B. 多档案扩展与独立审核结论",
    toc_s6_gal: "VI. GPU+CPU 架构与银河系致密双星",
    toc_s6: "VII. 经审核的发现数据总表",

    stat_lbl_new: "审核保留候选体",
    stat_lbl_tnos: "保留的海王星外天体",
    stat_lbl_gold: "短弧小行星候选体",
    stat_lbl_baseline: "L2×CTIO 同步基线",
    stat_lbl_papers: "方法属性图节点",

    click_zoom: "点击放大检视",
    lightbox_close: "关闭 [Esc] ✕",

    s1_kicker: "第 I 节 · 探测物理机制",
    s1_title: "跨越四个数量级角速度的天球视运动与源恢复",
    s1_p1:
      "地球公转速度使冲日附近的遥远太阳系天体产生与距离成反比的反冲漂移，而内太阳系星子则在单次曝光内横扫空间焦平面。标准短弧算法依赖夜内多次曝光配对。越过柯伊伯悬崖后，天体视角速度降至每小时三角秒以下，夜内位移缩减至地面视宁度宽度附近，导致海王星外天体在差分目录中滞留为孤立点源。在银道面密集星场中，背景恒星密度超出运动星子五个数量级；而在日地 <math><msub><mi mathvariant=\"normal\">L</mi><mn>2</mn></msub></math> 点 ESA Euclid 望远镜的 0.1 角秒硅像素阵列上，快速运动的小行星拉出数十像素的细长条纹，极易被误判为掠射宇宙线。",
    s1_p2:
      "跨尺度捕获运动天体需要令搜索算子严格匹配物理角速度尺度。在 Vera C. Rubin 天文台试运行曝光中，将未关联差分源与孤立单次曝光点扩散函数源取并集，可直接找回蓝端与远红端因差分核噪声而漏检的过境信号：",
    eq_union_name: "混合源并集算子",
    s1_p3:
      "给定试探质心逆距离与径向速度后，混合源并集算子从每次曝光中精确扣除观测站视差反冲，无需夜内配对即可将跨月过境点折叠为切平面直线轨迹。图 1 以示意动画展示多历元闪烁对比的物理过程；读者可在下方互动比较器中直接检验 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_003\">DELTA_003 ↗</a>、<a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"EPS_002\">EPS_002 ↗</a> 与 Euclid 回收对照 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge emerald js-3d-link\" data-fly-focus=\"EUCLID_EES149_GOLD_18\">2019 UM31 ↗</a> 的实测天体测量坐标。",

    gif1_fb_title: "多历元星空闪烁序列 (anim1_blink_where_is_it.gif)",
    gif1_fb_sub: "背景恒星在多历元间保持静止，太阳系天体沿视差回路逐帧步进。请使用下方示意比较器按实测历元逐帧切换。",
    fig1_cap:
      "<strong>图 1（示意动画）。</strong>静止背景星场与运动海王星外天体的多历元闪烁对比序列。恒星在各次曝光间保持固定赤经与赤纬，而太阳系天体在冲日附近向西漂移，随后弯曲进入东大距折返点。",

    w1_kicker: "互动示意图 · 实测天体测量坐标，星场为示意",
    w1_title: "闪烁比较器：按实测历元坐标定位运动天体",
    w1_t_d003: "DELTA_003（51.15 AU 极端 TNO 候选体）",
    w1_t_eps002: "EPS_002（银道面 TNO 候选体）",
    w1_t_gold18: "2019 UM31（Euclid 回收对照）",
    w1_auto_on: "自动闪烁：开启",
    w1_auto_off: "自动闪烁：暂停",
    w1_reticle: "目标准星与轨迹",
    w1_diff: "差分减除模式",
    w1_scrubber: "历元滑块：",
    w1_interval: "闪烁间隔：",
    tel_target: "目标：",
    tel_epoch: "观测时刻 (UTC)：",
    tel_phot: "测光：",
    tel_regime: "动力学区间：",

    s2_kicker: "第 II 节 · 极端轨道力学",
    s2_title: "东大距视线旋转与四巨行星倾角下限",
    s2_p1:
      '为何短弧冲日观测无法约束遥远天体的半长轴，而全季追踪又如何锁定 <a href="#" target="_blank" rel="noopener" class="fly-badge copper js-3d-link" data-fly-focus="DELTA_003">DELTA_003 (LSST-DP2-D03) ↗</a> 的真实轨道？在冲日附近，地球引力加速度使视轨迹产生与质心距离 <math><mi>r</mi></math> 成反比的弯曲，从而分离距离 <math><mi>r</mi></math> 与切向速度 <math><msub><mi>v</mi><mo>⊥</mo></msub></math>，但径向速度 <math><mover><mi>r</mi><mo>˙</mo></mover></math> 沿视线方向投影。以当地圆轨道速度 <math><mrow><msub><mi>v</mi><mi>circ</mi></msub><mo>≡</mo><msqrt><mrow><mi>μ</mi><mo>/</mo><mi>r</mi></mrow></msqrt></mrow></math>（其中 <math><mi>μ</mi></math> 为太阳系质心引力常数）归一化，可定义切向动能参数 <math><mrow><mi>κ</mi><mo>≡</mo><msup><mrow><mo>(</mo><msub><mi>v</mi><mo>⊥</mo></msub><mo>/</mo><msub><mi>v</mi><mi>circ</mi></msub><mo>)</mo></mrow><mn>2</mn></msup></mrow></math> 与无量纲径向速度 <math><mrow><mi>η</mi><mo>≡</mo><mover><mi>r</mi><mo>˙</mo></mover><mo>/</mo><msub><mi>v</mi><mi>circ</mi></msub></mrow></math>。活力积分与比角动量给出半长轴 <math><mi>a</mi></math> 和偏心率 <math><mi>e</mi></math> 的两条精确运动学关系：',
    eq_locus_name: "折返点轨迹与偏心率超额关系",
    s2_p2:
      "超圆切向速度（<math><mrow><mn>1</mn><mo>&lt;</mo><mi>κ</mi><mo>&lt;</mo><mn>2</mn></mrow></math>）严格排除了所有处于远日点的主柯伊伯带混入天体（<math><mrow><mi>a</mi><mo>≤</mo><mi>r</mi></mrow></math>）。在短暂的冲日窗口内，<math><mi>η</mi></math> 仅以二阶透视项进入天球坐标，使轨道后验解从径向折返点 <math><mrow><mi>η</mi><mo>=</mo><mn>0</mn></mrow></math> 一直延伸至高偏心率区域（图 2）。穿过东大距补获四次单次曝光与差分过境点后，地球视线相对于天体径向矢量发生显著旋转，外向径向位移直接投影至赤经方向，以高显著性锁定 <math><mrow><mi>η</mi><mo>&gt;</mo><mn>0</mn></mrow></math>，使 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_003\">DELTA_003 ↗</a> 坍缩至拟合半长轴邻近海王星 12:1 平运动共振的外向极端海王星外轨道（图 3 与图 4）。",
    s2_p3:
      '纵观整个多冲日太阳系星表，一旦近日点距离 <math><mi>q</mi></math> 脱离海王星半长轴 <math><msub><mi>a</mi><mi mathvariant="normal">N</mi></msub></math>，极端海王星外天体便在黄道面附近彻底绝迹。圆轨道海王星的近距离散射将蒂塞朗不变量限制在 <math><mrow><msub><mi>T</mi><mi mathvariant="normal">N</mi></msub><mo>≤</mo><mn>3</mn></mrow></math>；此后在轴对称外共振内的古在-利多夫近日点抬升过程严格守恒归一化垂直角动量 <math><mrow><msub><mi>J</mi><mi>z</mi></msub><mo>≡</mo><msqrt><mrow><mn>1</mn><mo>−</mo><msup><mi>e</mi><mn>2</mn></msup></mrow></msqrt><mi>cos</mi><mo>⁡</mo><mi>i</mi></mrow></math>。联立两项守恒律即导出轨道倾角余弦的解析上限：',
    eq_floor_name: "蒂塞朗–古在倾角下限",
    s2_p4:
      "按其拟合轨道，<a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_003\">DELTA_003 ↗</a> 位于蒂塞朗–古在倾角下限以下逾十一度。独立审核将该天体及其拟合轨道根数评为“可信、尚待后续观测”，否定了此前“已知极端轨道中倾角最低”的说法，并将蒂塞朗参数与共振粘滞的动力学解释评为存疑，因此图 5 的动力学解读仅为初步结果。同批在摩羯-宝瓶黄道带盲搜得到的候选体 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_004\">DELTA_004 ↗</a>、<a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_009\">DELTA_009 ↗</a> 与 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"DELTA_014\">DELTA_014 ↗</a> 进一步扩展了远距黄道星子样本；其中 DELTA_009 的 2022 年 DECam 预发现图像与拟合半长轴已获审核核实。",

    gif2_fb_title: "双锥距离-径向速度盲搜与东大距轨道坍缩 (anim2_double_cone_quadrature_collapse.gif)",
    gif2_fb_sub: "东大距视线旋转将冲日一维折返点轨迹直接坍缩至海王星 12:1 共振旁的外向极端轨道。",
    fig2_cap:
      "<strong>图 2（示意动画）。</strong>质心轨道后验分布从短弧冲日视差向全季东大距锁定的演化过程。视线旋转将外向径向速度投影至黄经方向，使一维折返点曲线坍缩为极端海王星外椭圆轨道。",
    fig3_cap:
      "<strong>图 3.</strong> LSST-DP2-D03 跨越四个光学波段的天球视差回路、非过境历元强迫差分通量检验，以及包含 ALMA 亚毫米热辐射预言的宽波段流量限制（详见第 VII 节数据总表）。",
    fig4_cap:
      "<strong>图 4.</strong> 半长轴-近日点平面内冲日折返点轨迹向海王星 12:1 共振的坍缩，以及全体多冲日极端海王星外天体所受的蒂塞朗–古在倾角下限。",
    fig5_cap:
      "<strong>图 5.</strong> 东大距后验克隆系综的前向辛轨道演化，展示半长轴相对扩散度、近日点绝热守恒以及外平运动共振粘滞台阶。",

    s3_kicker: "第 III 节 · 瞬时天地立体三角测量",
    s3_title: "跨越日地拉格朗日基线的天地同步立体视差",
    s3_p1:
      '单站巡天需要等待数周地球公转才能积累视差基线，暗弱外太阳系新目标极易因月相中断与晨昏蒙影而丢失。利用环绕日地 <math><msub><mi mathvariant="normal">L</mi><mn>2</mn></msub></math> 点运行的 ESA Euclid 空间望远镜（台站码 <code>273</code>）与智利托洛洛山四米 Blanco 望远镜暗能量相机（台站码 <code>W84</code>）对同一天区实施同步观测，可构建超过地月距离四倍的刚性空间-地面瞬时基线 <math><msub><mi mathvariant="bold">B</mi><mrow><mi mathvariant="normal">L2</mi><mo>−</mo><mi mathvariant="normal">W84</mi></mrow></msub></math>。将该基线垂直投影至目标视线 <math><mover><mi mathvariant="bold">n</mi><mo>^</mo></mover></math>，即可由单一同步历元直接测定几何距离：',
    eq_stereo_name: "立体视差三角测量关系",
    s3_p2:
      "将 Euclid 黄道巡天曝光与智利托洛洛山同步叠加图像交叉匹配后，两颗未编目海王星外天体候选体 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUC0005\">EUC0005 ↗</a> 与 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUC0002\">EUC0002 ↗</a> 在 <math><mrow><mi mathvariant=\"normal\">L</mi><mn>2</mn><mo>→</mo><mi mathvariant=\"normal\">W84</mi></mrow></math> 核线方向上出现 DECam 对应体（图 6 与图 7）。独立审核在 VIS 像素上核实了两处 Euclid 探测并复现了 DECam 信号；这些信号并非静态源，单个目标的经验偶然概率约为百分之一至二。审核将二者评为“可信、尚待后续观测”的候选体，不支持此前引用的显著性、由模型生成的地面天体测量位置以及拟合轨道；若匹配成立，立体视差距离即成立。拖动下方基线滑块，即可从智利台站平滑移动至日地 <math><msub><mi mathvariant=\"normal\">L</mi><mn>2</mn></msub></math> 点并查看视差位移。",

    gif3_fb_title: "168.5 万公里 L2 × 智利同步立体视差 (anim3_l2_stereoscopic_parallax.gif)",
    gif3_fb_sub: "智利 CTIO (W84) 与日地 L2 点 Euclid (273) 的同步视线使 EUC0005 沿核线方向产生 64.19 角秒瞬时视差位移。",
    fig6_cap:
      "<strong>图 6（示意动画）。</strong>智利托洛洛山地面站与日地 L2 点 ESA Euclid 之间的同步几何三角测量。遥远背景恒星保持不动，海王星外目标则沿基线矢量位移约一角分。",
    fig7_cap:
      "<strong>图 7.</strong> 远距候选体与三个小行星场目标位置处的十四组档案切片（每组上图）与同一天区的对照图（下图），取自暗能量相机与 Euclid VIS 单次曝光，并标注日期、波段与孔径信噪比。最后一组为已编目小行星 2019 UM31（回收对照）的拖尾图像。上北左东。取自经审核的论文稿。",

    w2_kicker: "168.5 万公里基线互动三角测量仪",
    w2_title: "立体视差滑块：智利 CTIO (地球) ↔ ESA Euclid (日地 L2)",
    w2_t_euc5: "EUC0005（视差 64.19″ · 若匹配成立则 35.60 AU）",
    w2_t_euc2: "EUC0002（视差 66.47″ · 若匹配成立则 34.40 AU）",
    w2_btn_earth: "智利 CTIO (0 km)",
    w2_btn_l2: "Euclid L2 (168.5万 km)",
    w2_sweep_on: "自动往返扫描：开启",
    w2_sweep_off: "自动往返扫描：暂停",
    w2_slider_lbl: "观测者在天地立体基线上的位置：",
    tel_baseline: "基线位置：",
    tel_shift: "视差角位移：",
    tel_range: "三角测定距离：",
    tel_bound: "动能下限约束：",

    s4_kicker: "第 IV 节 · 密集星场、短弧条纹与彗发光谱",
    s4_title: "银道面候选体、Euclid 硅像素条纹与空间彗发光谱",
    s4_sub1: "A. 穿透银河系远日点巡天盲区",
    s4_p1:
      "外太阳系巡天通常避开人马座与蛇夫座恒星云同黄道相交的低银纬区域，而远距天体的远日点走廊恰恰穿越这片银道面背景。在该高密度走廊内联合差分成像与非过境历元强迫测光否决，分离出两颗明亮的未编目海王星外天体候选体：位于银道面北侧七度的 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"EPS_002\">EPS_002 ↗</a> 与银核南侧的 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-focus=\"EPS_007\">EPS_007 ↗</a>（图 8 与图 9）。独立审核将二者评为“可信、尚待后续观测”，并对此前为 EPS_002 提出的矮行星尺度表示存疑。在 2024 年 4 月 18 日的两帧 DECam 档案图像中，EPS_002 所在位置的孔径信噪比仅为 2.1 与 2.8，且处于密集星场，单凭这些像素不足以确认该天体。",
    gif4_fb_title: "银道面盲区穿透发现：EPS_002 (anim4_galactic_blindspot_eps002.gif)",
    gif4_fb_sub: "差分图像减除抵消了 b = +7.1° 处密集的人马-蛇夫座背景恒星，分离出海王星外天体候选体 EPS_002。",
    fig8_cap:
      "<strong>图 8（示意动画）。</strong>利用差分成像与非过境历元强迫测光静态星剔除，在低银纬银河系交叉带内捕获海王星外天体候选体 EPS_002。",
    fig9_cap:
      "<strong>图 9.</strong> 候选体的拟合轨道与双星形状检验。(a) 各搜索的近日点-半长轴分布，附海王星近日点线与共振位置；空心方块为短弧无法确定轨道的 Euclid 候选体的标称值。(b) 150 au 以外已发表天体与 R25-D03（<math><mi>i</mi><mo>=</mo><mn>3.16</mn><mo>°</mo></math>）的倾角-近日点分布，曲线为蒂塞朗参数等于三。(c) 2025 NW189 逐次曝光与叠加的天球四极矩，并与 2025 NU192、已编目宽距双星及单体对照比较；独立审核将 NW189 的双星判定评为存疑，NU192 的判定未获支持。取自经审核的论文稿。",

    s4_sub2: "B. Euclid 硅像素上的短弧小行星条纹与暗弱海王星外天体候选体",
    s4_p2:
      "在 ESA Euclid 可见光相机上，明亮运动小行星条纹会触发星上宇宙线掩模（<code>0x10</code>），同时近一万二千颗近地星座卫星与十六艘 <math><msub><mi mathvariant=\"normal\">L</mi><mn>2</mn></msub></math> 深空探测器频繁穿越巡天视场。通过恢复横向轮廓符合 Korsch 光学点扩散函数的被掩模条纹核、在完整 <math><msub><mi mathvariant=\"normal\">L</mi><mn>2</mn></msub></math> 光行时几何下连接可见光与近红外抖动曝光，并实施实时双行根数卫星轨道否决，得到 {{euclid_tnos}} 颗经独立审核保留的 Euclid 海王星外天体候选体——其中两颗具有单夜 DECam 立体视差对应体（<a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUC0005\">EUC0005 ↗</a> 与 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUC0002\">EUC0002 ↗</a>），另有两颗位于同一黄道区块的慢速运动源（<a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"EUCLID_VIS_TNO_02\">EUCLID_VIS_TNO_02 ↗</a> 与 <code>EUCLID_VIS_TNO_03</code>），审核认为其距离尚无约束——以及 {{asteroids}} 颗短弧小行星候选体，其中 {{ees_asteroids}} 颗同时出现在 VIS 与 NISP 中（图 10 与图 11）。不足一天的弧段只能给出视运动与亮度，无法确定轨道、尺寸或光谱分类。另一条双仪器轨迹 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge emerald js-3d-link\" data-fly-focus=\"EUCLID_EES149_GOLD_18\">EUCLID_EES149_GOLD_18 ↗</a> 实为已编目主带小行星 2019 UM31：它从来不是近地天体，现作为 Euclid VIS 回收对照保留。",
    fig10_cap:
      "<strong>图 10.</strong> 小行星候选体 EUC-G26 至 EUC-G32、COSMOS 候选体 EUC-J01、EUC-J02 与 EUC-M01 至 EUC-M03 以及深场候选体的 Euclid VIS 单次曝光图像，每幅下方为同一天区其他历元的对照图。最后一组为已编目小行星 2019 UM31（回收对照）的拖尾图像。取自经审核的论文稿。",
    fig11_cap:
      "<strong>图 11.</strong> 远距候选体位置处的档案像素。首行为 R25-E02、R25-D09、EUC-S05、EUC-S02 与 EUC-CW04 位置处的暗能量相机曝光；其余各行为 {{euclid_tnos}} 颗海王星外天体候选体的 Euclid VIS 单次曝光（最暗至 <math><msub><mi>I</mi><mi mathvariant=\"normal\">E</mi></msub><mo>=</mo><mn>25.4</mn></math>）。每幅切片下方为同一天区其他历元的对照图；实线十字标记所示历元的预期位置，虚线十字标记其他历元的同一位置。上北左东。取自经审核的论文稿。",

    s4_sub3: "C. 瞬变保留红外彗发光谱",
    s4_p3:
      "地面光谱观测受地球大气一氧化碳与二氧化碳强烈吸收阻挡，而 NASA SPHEREx 静态天空管线会将运动太阳系目标标记为瞬变异常值（<code>bit 19</code>）。通过字节范围流式切片保留 <code>bit 19</code> 运动通量、剔除静态恒星混叠（<code>bit 21</code>）并引入近地轨道卫星视差，得到星际来客 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"ATLAS_3I\">3I/ATLAS ↗</a> 与活跃半人马天体 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"SW1_29P\">29P/Schwassmann–Wachmann 1 ↗</a> 的彗发光谱（图 12 与图 13）。独立审核确认 3I/ATLAS 的一氧化碳与 <sup>12</sup>CO<sub>2</sub> 辐射以及 29P 的一氧化碳辐射，不支持本页早期版本报告的 <sup>13</sup>CO<sub>2</sub> 与水冰探测。图 14 将从回收对照 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge emerald js-3d-link\" data-fly-focus=\"EUCLID_EES149_GOLD_18\">2019 UM31 ↗</a> 所在的主小行星带直至内奥尔特云（<a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge copper js-3d-link\" data-fly-cat=\"oort_cloud\">3D 奥尔特云视角 ↗</a>）的全部样本置于同一对数日心距离标尺之下。",
    fig12_cap:
      "<strong>图 12（审核前图件）。</strong>星际彗星 3I/ATLAS 的 Rubin 双曲线轨迹回收与 SPHEREx 线性渐变滤光片彗发分光测光。独立审核确认其中的一氧化碳与二氧化碳辐射；图中标注的水冰吸收未获支持。",
    fig13_cap:
      "<strong>图 13.</strong> 档案联合得到的光谱与能谱分布。(a) 彗星 3I/ATLAS、半人马天体 29P/Schwassmann–Wachmann 1 与小行星 (492) Gismonda 的 SPHEREx 光谱，以及 2015 BP519 的 Euclid 测光（经缩放与偏移）；虚线标记水、二氧化碳与一氧化碳波段。(b) (87) Sylvia 的热辐射流量、热模型曲线与已发表的 ALMA 测点；菱形为 (6493) Cathybennett 的 Euclid 流量。(c) 一颗已发表远红外行星候选体位置处的档案流量与示意曲线、另一候选体的射电流量，以及 R25-D03 的流量上限。取自经审核的论文稿。",
    gif5_fb_title: "太阳系至奥尔特云对数尺度连续缩放 (anim5_solar_to_oort_zoom.gif)",
    gif5_fb_sub: "从内太阳系连续跨越主小行星带、半人马天体、柯伊伯带及 DELTA_003（按拟合轨道远日点 277 AU）直抵奥尔特云。",
    fig14_cap:
      "<strong>图 14（示意动画）。</strong>跨越五个数量级日心距离的太阳系径向结构：从主带小行星与活跃半人马天体延伸至极端海王星外椭圆轨道与奥尔特云彗星。",

    s5_kicker: "第 V 节 · 方法学拆解与合成",
    s5_title: "能力拆解与多望远镜合成超图",
    s5_p1:
      "单一巡天档案在原生数据处理中往往预设目标静止或具备快速夜内位移，从而系统性丢弃特定动力学区间的运动天体。本发现系统的构建始于将已发表的太阳系轨道连接、移位叠加、立体视差与瞬变掩模文献索引为混合属性-向量图数据库（<code>MethodGraphVectorDB</code>），把十二类巡天失效模式精确映射至不同观测传统中的数学算子。",
    s5_p2:
      "四条耦合合成超边将这些拆解后的底层能力组装为统一的跨波段搜索引擎（图 15）。点击下方超图中的任意节点或超边，即可追踪文献失效诊断如何把空间天体测量、地面差分成像、拉格朗日点立体三角测量与红外分光合成为候选体，并交由独立审核评级。",

    hg_col1: "失效模式文献诊断",
    hg_col2: "拆解后的巡天算子引擎",
    hg_col3: "多望远镜合成超边",
    hg_col4: "审核后产出",
    hg_mg_l1: "30 篇 arXiv 论文 · 79 节点",
    hg_mg_l2: "384 条有向边 · 12 类失效模式",
    hg_mg_l3: "• 50 AU 外夜内短弧漏检",
    hg_mg_l4: "• 0x10 条纹与 bit-19 误裁",
    hg_mg_l5: "• 冲日径向速度 η 简并",
    hg_e1_t: "Vera C. Rubin DP2 (X05 台站)",
    hg_e1_s1: "-O3 C 双锥 BK (γ, γ̇) 盲搜核",
    hg_e1_s2: "DiaSource ∪ 孤立 Source + 强迫测光",
    hg_e1_s3: "REBOUND IAS15 / WHFast (DE441)",
    hg_e2_t: "ESA Euclid DR1 @ 日地 L2",
    hg_e2_s1: "0.10″/px VIS 条纹 (0x10 核心保护)",
    hg_e2_s2: "NISP Y_E/J_E/H_E + @-680 SPICE",
    hg_e2_s3: "CTIO DECam (W84) 同步曝光配对",
    hg_e3_t: "航天器与静态天空多波段否决",
    hg_e3_s1: "SGP4 11,899 颗卫星 + 16 艘 L2 探测器",
    hg_e3_s2: "Gaia DR3 · CatWISE · ASKAP 888 MHz",
    hg_e3_s3: "2000–2024 DECam / CFHT / PS1 历史库",
    hg_e4_t: "NASA SPHEREx S3 + ESO ALMA",
    hg_e4_s1: "0.75–5.00 µm 纯内存 HTTP Range",
    hg_e4_s2: "保留 bit-19 瞬变 · 剔除 bit-21 混叠",
    hg_e4_s3: "LEO 视差校正 + ALMA Band 6/7 热辐射",
    hg_h1_t: "东大距与银道面轨道锁定器",
    hg_h1_s1: "124.8 天全季弧段延伸 (η > 0)",
    hg_h1_s2: "其他历元静态天空否决",
    hg_h2_t: "168.5 万公里 3D 立体三角仪",
    hg_h2_s1: "L2 (273) × DECam (W84) 核线几何",
    hg_h2_s2: "单夜立体视差测距",
    hg_h3_t: "多访次 L2 开普勒轨道连接器",
    hg_h3_s1: "VIS+NISP 四波段测光",
    hg_h3_s2: "人造卫星轨道传播否决",
    hg_h4_t: "挥发物与热辐射综合解算器",
    hg_h4_s1: "CO / 12CO2 发射带",
    hg_h4_s2: "NEATM 反照率 + 870 µm 流量约束",
    hg_y1_s1: "DELTA_003：拟合 a = 156.6 AU",
    hg_y1_s2: "EPS_002（银道面）",
    hg_y2_s1: "2 颗立体视差候选体（可信）",
    hg_y2_s2: "COSMOS 场 3 颗已核实",
    hg_y3_s1: "回收对照：2019 UM31",
    hg_y3_s2: "弧段不足一天 · 轨道未定",
    hg_y4_s1: "CO 与 12CO2 已确认",
    hg_y4_s2: "13CO2 / 水冰未获支持",
    hg_fly_all: "在 3D 探索器中检视产出 ↗",
    fig15_cap:
      "<strong>图 15.</strong> 多望远镜自动发现系统的能力拆解与合成超图。有向曲线展示了文献失效模式诊断如何通过四条合成超边（虚线框）将拆解后的各档案算子组合为候选体产出。经独立审核后，该产出为 {{claims}} 项宣称中保留的 {{survivors}} 颗候选体，以及已确认的彗发辐射带。",

    s6_kicker: "第 VII 节 · 观测与轨道数据总表",
    s5b_kicker: "第 V-B 节 · 多档案扩展与独立审核",
    s5b_title: "从 {{claims}} 项宣称到 {{survivors}} 颗审核保留候选体：孤儿短弧库连接、木星卫星候选体与被剔除的内容",
    s5b_p1: "将系统扩展至十余个空间与地面档案后——融合面向全球 905 万行 MPC 孤儿短弧库的 GPU 加速四阶开普勒有效时间连接器、深场次阈值移位叠加、天球四极矩形状检验以及行星中心希尔球卫星搜寻算法——太阳系宣称总数增至 {{claims}} 项。独立审核保留其中 {{survivors}} 项：{{group1_tnos}} 颗来自 Rubin 与孤儿短弧库的海王星外天体候选体、{{euclid_tnos}} 颗 Euclid 海王星外天体候选体、{{centaurs}} 颗半人马天体、{{moons}} 颗木星不规则卫星候选体与 {{asteroids}} 颗短弧小行星候选体；另有 {{catalogued}} 项被证认为已编目天体（多为主带小行星），{{eliminated}} 项被剔除，{{disputed}} 项存疑。图 16–18 绘制于审核之前，现附更正后的图注留存备查；原先置于本节开头的切片拼图中，“发现”切片为渲染所得而非实际观测，现已由真实像素影像图库取代。",
    fig16_cap: "<strong>图 16（审核前图件）。</strong>审核前所宣称的外太阳系轨道的黄道面俯视构型（a）与垂直结构（b），其中包含已被审核剔除的 <code>W3A_ITF_010</code>（a = 224.9 au）。保留候选体的拟合轨道仍为初步结果。",
    fig17_cap: "<strong>图 17（审核前图件）。</strong>四项木星卫星宣称相对于已知卫星族群的木心轨道根数分布（a）、相对木星的天球视运动轨迹（b）及天体测量残差（c）。独立审核将 <code>W4_JUP_MOON_GOLD_001</code> 至 <code>003</code> 保留为可信候选体，剔除 <code>W4_JUP_MOON_GOLD_004</code>，并对族群归属表示存疑。",
    fig18_cap: "<strong>图 18（审核前图件）。</strong>依据独立审核之前的完整宣称清单绘制的统计：质心半长轴与近日点分布（a）、推算直径与距离及 Rubin/JWST 探测极限曲线（b）、天球位置分布（c）以及天体测量残差均方根分布（d）。独立审核在 {{claims}} 项宣称中保留 {{survivors}} 项；图 d 的坐标轴标签“Verified objects”早于该审核。",
    fig19_cap: "<strong>图 19（审核前图件）。</strong>银心旋臂结构与致密天体基准分布（a）、天体测量质量比函数与轨道周期关系及欧几里得南深场候选体 <code>Gaia DR3 4829790543688453504</code>（b），以及宽距双星归一化速度与投影间距和 Rubin 3.6 角秒内邻源检测结果（c）。独立审核将图 b 的暗致密伴星解读与图 c 的速度异常评为存疑。",
    s6g_kicker: "第 VI 节 · 模块化 GPU+CPU 搜索架构与银河系视野",
    s6g_title: "从奥尔特云到银河系致密双星：Gaia、Euclid 与 Rubin 跨尺度联合框架",
    s6g_p1: "用于捕获海王星外慢速星子的多档案融合原理可直接延伸至银河系尺度。在自包含的 <code>astro_search</code> 框架中，辛几何 Wisdom–Holman 太阳系传播（较 CPU 提速 285 倍）、轴对称银河系引力势积分（<code>MWPotential</code>，162 万条蒙特卡洛轨道提速 565 倍）、Thiele–Innes 天体测量轨道反演、近红外发光伴星否决、宽距双星配对（提速 86 倍）与椭球周期图（提速 88 倍）在 GPU 并行阵列与多核 CPU 上保持数值一致，该一致性已获独立审核核实；全部算法由涵盖三十八种太阳系、奥尔特云与银河系搜索算法的规范化数据库统一索引。",
    s6g_p2: "将该四档案管线应用于 Gaia DR3、ESA Euclid DR1、Rubin DP2 与 SIMBAD 后，系统盲搜重现了基准中子星双星 <code>Gaia NS1</code> 与已知非束缚恒星 <code>UCAC4 656-058031</code>（二者均获独立审核核实），并将 188 颗高 RUWE 恒星与 Rubin <code>dp2</code> 交叉匹配（其中 138 颗为多历元 <code>DiaObject</code> 变源）。独立审核将欧几里得南深场天体测量双星 <code>Gaia DR3 4829790543688453504</code> 的暗致密伴星解释（图 19b）以及九对宽距双星的速度异常（图 19c）评为存疑，并且不支持此前关于一颗新的逃逸边界银晕巨星的说法。读者可在 3D 探索器与 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-playground=\"1\">互动 3D 模型实验室 ↗</a> 中漫游 82,199 颗 Gaia DR3 恒星以及 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"SGR_A_STAR\">人马座 A* ↗</a>、<a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"GAIA_BH1\">Gaia BH1–BH3 ↗</a> 与 <a href=\"#\" target=\"_blank\" rel=\"noopener\" class=\"fly-badge js-3d-link\" data-fly-focus=\"CYGNUS_X1\">天鹅座 X-1 ↗</a> 的相对论吸积盘与引力透镜模型。",
    s6_title: "经审核的数据总表：{{ledger_survivors}} 颗保留候选体、{{ledger_disputed}} 项存疑宣称、{{ledger_known}} 个已知天体与回收对照，以及 {{ledger_volatile}} 个光谱目标",
    s6_p1:
      "下表列出审核前提出且仍保留在星表中的每一项宣称及其审核状态，其后为 SPHEREx 光谱目标。只有标注为<strong>审核保留</strong>的条目计入发现候选体；存疑宣称、已编目天体与回收对照仅为透明起见列出，从不计入。天球坐标、观测历元、星等、日心距离与轨道根数（<math><mrow><mi>a</mi><mo>,</mo><mi>q</mi><mo>,</mo><mi>e</mi><mo>,</mo><mi>i</mi><mo>,</mo><mi>ϖ</mi><mo>,</mo><msub><mi>T</mi><mi mathvariant=\"normal\">N</mi></msub></mrow></math>）均为搜索所测量或拟合的数值，每行下方的说明引自审核结论。点击任意表头可排序，使用上方按钮按族群或审核状态筛选，或在 3D 探索器中打开该天体的轨道。",

    lf_all: "全部族群",
    lf_etno: "Rubin 与孤儿短弧库 TNO / 半人马天体",
    lf_stereo: "Euclid 海王星外天体条目",
    lf_moon_bin: "木星卫星候选体",
    lf_gold: "内太阳系条目",
    lf_vol: "SPHEREx 光谱目标",
    ledger_search_ph: "搜索编号、已知编号、审核状态或望远镜...",
    th_obj: "天体编号 · 审核状态",
    th_fac: "望远镜 / 弧段跨度",
    th_coord: "ICRS (α, δ)",
    th_mag: "星等 / H",
    th_r: "r (AU)",
    th_size: "尺度 / 谱带 · 审核说明",
    th_3d: "3D 轨道",
    fly_row_btn: "3D ↗",

    hero_cta_gallery: "{{movie_targets}} 目标真实像素影像图库 ↗",
    nav_hub: "门户首页",
    nav_gallery: "影像图库",
    toc_audit: "审核状态与真实像素",
    stat_lbl_claims: "审核前宣称",
    stat_lbl_disputed: "存疑（不计入）",
    stat_lbl_catalogued: "证认为已编目天体",
    stat_lbl_eliminated: "已剔除",
    stat_lbl_moons: "木星卫星候选体",
    stat_lbl_movies: "真实像素影像目标",
    stat_lbl_frames: "真实档案帧",
    stat_lbl_stars: "Gaia 三维恒星（探索器）",
    audit_kicker: "独立审核 · 请先阅读",
    audit_title: "独立审核保留、存疑与剔除的内容",
    audit_p1: "搜索结束后，另一组智能体基于项目的只读副本，以独立的档案查询、轨道拟合与档案像素测量对每一项宣称重新评级。审核前提出的 <strong>{{claims}}</strong> 项太阳系宣称中，<strong>{{survivors}}</strong> 项作为待后续观测的候选体得以保留（其中 {{per_object}} 项逐目标评级，{{per_claim}} 项通过群组存在性检验评级；{{verified}} 项评为已核实，{{plausible}} 项评为可信）。<strong>{{catalogued}}</strong> 项被证认为已编目天体，<strong>{{eliminated}}</strong> 项被剔除，<strong>{{disputed}}</strong> 项仍然存疑且不计入。所有保留天体均为候选体，尚待小行星中心给予编号并获得独立回收观测。",
    audit_p2: "<strong>对本页早期版本的更正。</strong><code>EUCLID_EES149_GOLD_18</code>（论文编号 EUC-G18）曾在本页被描述为直径约百米的近地小行星，实为已编目主带小行星 <strong>2019 UM31</strong>（a = 2.60 au，e = 0.31，i = 7.05°，H = 19.3）；其 2019 年小行星中心天体测量数据与 Euclid 探测的联合拟合证实二者为同一天体。它从来不是近地天体，现与 Rubin 回收对照 <strong>2021 QB98</strong> 一同作为 Euclid VIS 回收对照保留。孤儿短弧库连接 <code>W3A_ITF_010</code>（a = 224.9 au）、另一项 Rubin 宣称、四项木星卫星宣称中的一项以及三条 Euclid 深场记录已被剔除。2025 NU192 的宽距双星判定未获支持，2025 NW189 的判定存疑。弧段不足一天的小行星候选体没有确定的轨道、尺寸或光谱分类。对于两颗 Euclid × DECam 立体视差候选体，审核核实了 Euclid 探测并复现了 DECam 信号，但不支持此前引用的显著性与拟合轨道。在 SPHEREx 光谱中，审核确认 3I/ATLAS 的 CO 与 <sup>12</sup>CO<sub>2</sub> 辐射以及 29P 的 CO 辐射，不支持 <sup>13</sup>CO<sub>2</sub> 与水冰探测。",
    audit_p3: "<strong>真实像素。</strong><a href=\"../movie_gallery/index.html\">影像图库</a>收录 <strong>{{movie_targets}}</strong> 个目标的档案图像序列：{{movie_discovery_targets}} 个发现目标与 {{movie_controls}} 个回收对照，共 <strong>{{movie_frames}}</strong> 帧真实档案图像，其中 {{movie_single}} 帧为单次曝光，合成帧 <strong>{{movie_synthetic}}</strong> 帧，覆盖缺口 {{movie_gaps}} 处。其中 {{movie_no_epoch}} 个目标（十一个第 I 组目标与 2021 QB98 对照）在档案中仅有静态深度叠加图，因此不提供探测历元像素。本页的动画与互动画布均为由实测天体测量坐标驱动的示意图，不含档案像素；图 7、9、10、11 与 13 取自经审核的论文稿。",
    audit_link_gallery: "{{movie_targets}} 目标影像图库",
    audit_link_ms: "经审核的论文稿 (PDF)",
    audit_link_verdicts: "审核结论台账 (JSON)",
    hg_y1_t: "{{group1_tnos}} 颗 TNO 候选体",
    hg_y2_t: "{{euclid_tnos}} 颗 Euclid TNO 候选体",
    hg_y3_t: "{{asteroids}} 颗小行星候选体",
    hg_y4_t: "3I/ATLAS 与 29P/SW1",
    realpix_note: "<strong>真实档案像素。</strong>单次曝光、静态参考图以及（在档案提供时的）差分图均收录于影像图库：<a href=\"../movie_gallery/index.html?group=group1\">第 I 组（Rubin 与 DECam）</a>、<a href=\"../movie_gallery/index.html?group=group2\">第 II 组（Euclid 海王星外天体候选体）</a>、<a href=\"../movie_gallery/index.html?group=group5\">第 V 组（Euclid 小行星候选体）</a>、<a href=\"../movie_gallery/index.html?group=galactic\">银河系恒星</a>以及<a href=\"../movie_gallery/index.html?group=controls\">两个回收对照</a>。",
    s6g_p3: "同一组档案联合还分离出 {{movie_galactic}} 颗低于 Gaia 探测极限的暗弱高自行恒星：一颗白矮星候选体、两颗晚 M 或早 L 型矮星候选体、十七颗超冷矮星候选体与五颗晚 M 型矮星候选体。独立审核核实了上述统计、自行的真实性以及九角秒内不存在 Gaia DR3 对应体；对所引用的自行显著性以及“全部此前未编目”的说法表示存疑。全部 {{movie_galactic}} 颗恒星的 Euclid、Legacy Surveys 与 Rubin 档案切片见<a href=\"../movie_gallery/index.html?group=galactic\">影像图库的银河系部分</a>。",
    la_all: "全部状态",
    la_survivor: "审核保留",
    la_disputed: "存疑 / 不计入",
    la_known: "已知天体 / 回收对照",
    la_volatile: "挥发物光谱目标",
    st_survivor: "审核保留",
    st_disputed: "存疑 / 不计入",
    st_control: "已知天体 / 回收对照",
    st_catalogued: "已知 / 已编目",
    st_volatile: "挥发物光谱",
    vd_verified: "已核实",
    vd_plausible: "可信 · 待后续观测",
    vd_disputed: "存疑或表述过度",
    vd_invalid: "宣称不成立或无依据",
    gl_object: "逐目标评级",
    gl_claim: "经群组宣称评级",
    orbit_open_tip: "独立审核不认可该行所列轨道",
    ledger_summary_fmt: "当前显示 {shown} / {total} 行 · {{ledger_survivors}} 项审核保留 · {{ledger_disputed}} 项存疑（不计入） · {{ledger_known}} 项已知天体或回收对照 · {{ledger_volatile}} 个光谱目标",
    ledger_legend: "<strong>†</strong> 轨道未确立：独立审核将该行所列轨道根数评为存疑或无依据；对于不足一天的弧段，尺寸同样无法确定。其余条目的尺寸基于假定反照率。另有 {{eliminated}} 项宣称被审核剔除（{{eliminated_list}}），已从星表中移除，故无对应行。",
    footer_hub: "门户首页",
    footer_gallery: "{{movie_targets}} 目标影像图库",
    footer_left:
      "数据致谢：ESA Euclid DR1-Foundation (MPC 273, NASA/IPAC IRSA)、Vera C. Rubin 天文台 Data Preview 2 (MPC X05)、NASA SPHEREx DR1+QR3、NOIRLab CTIO DECam (MPC W84)、ESO ALMA 及 JPL Horizons DE441。",
    footer_cta: "打开 3D 太阳系探索器 ↗",

    cv_loupe_title: "10× 像素切片放大镜",
    cv_diff_on: "差分图像减除已开启（静态背景星场已抵消）",
    cv_sky_view: "天球切平面星场视图（Gaia DR3 参考系）",
    cv_helio_view: "日心立体三角测量几何俯视图",
    cv_epipolar: "精确 L2 → W84 核线方向 (Δ⊥ = 0.00″)",
    cv_sun: "太阳",
    cv_earth_w84: "地球 (智利 CTIO W84)",
    cv_euclid_273: "Euclid @ 日地 L2 (273)",
    cv_observer: "当前虚拟观测站",
    cv_decam_note: "DECam 960 秒 r+i 对应体（可信候选）",
    cv_if_matched: "若匹配成立"
  }
};

/* ==========================================================================
   2. Hypergraph Node Inspector Bilingual Metadata
   ========================================================================== */
const HYPERGRAPH_DETAILS = {
  n_mgdb: {
    en: {
      title: "MethodGraphVectorDB — Literature Failure-Mode Decomposition (30 Papers, 79 Nodes, 384 Edges)",
      desc: "Hybrid SQLite property graph and 48-dimensional SVD dense index mapping twelve survey failure modes—intra-night tracklet drop-out beyond 50 AU, difference-kernel losses in g/z passbands, Euclid 0x10 streak clipping, and SPHEREx bit-19 outlier masking—onto exact cross-archive mathematical remedies.",
      fly: { category: "discoveries" }
    },
    zh: {
      title: "MethodGraphVectorDB — 文献失效模式拆解图谱（30 篇论文，79 个节点，384 条有向边）",
      desc: "混合 SQLite 属性图与 48 维稠密奇异值向量索引，将 50 AU 外夜内短弧漏检、g/z 波段差分核损失、Euclid 0x10 亮条纹误裁及 SPHEREx bit-19 运动源屏蔽等十二类失效模式精确映射至跨档案算子。",
      fly: { category: "discoveries" }
    }
  },
  n_rubin: {
    en: {
      title: "Vera C. Rubin Observatory DP2 Engine — C Double-Cone BK Sniper & Hybrid Source Union",
      desc: "GIL-free -O3 C Bernstein–Khushalani range-rate scanner operating on the union of unlinked dp2.DiaSource and orphan dp2.Source detections, coupled to REBOUND IAS15/WHFast barycentric orbit determination with JPL DE441 planetary ephemerides.",
      fly: { focus: "DELTA_003" }
    },
    zh: {
      title: "Vera C. Rubin DP2 引擎 — C 语言双锥盲搜核与混合源并集",
      desc: "无全局锁 -O3 C 语言 Bernstein–Khushalani 距离-径向速度扫描器，直接作用于未关联 dp2.DiaSource 与孤立 dp2.Source 并集，并耦合基于 JPL DE441 星历的 REBOUND IAS15/WHFast 质心轨道解算。",
      fly: { focus: "DELTA_003" }
    }
  },
  n_euclid: {
    en: {
      title: "ESA Euclid DR1 @ Sun–Earth L2 — Raw Silicon VIS Streak & Slow-Mover Engine",
      desc: "Streams 0.10 arcsec/pixel VIS quadrants and multi-epoch NISP Y_E/J_E/H_E catalogs in memory, resolves mirrored half-plane WCS headers, and preserves 0x10-flagged asteroid cores while suppressing single-pixel L2 cosmic rays.",
      fly: { focus: "EUCLID_EES149_GOLD_01" }
    },
    zh: {
      title: "ESA Euclid DR1 @ 日地 L2 — 原始硅像素条纹与慢速天体引擎",
      desc: "以内存流式方式读取 0.10 角秒/像素 VIS 象限与多历元 NISP 近红外星表，解析镜像焦平面 WCS 投影，保护被标记为 0x10 的明亮小行星光学核心并滤除单像素 L2 宇宙线。",
      fly: { focus: "EUCLID_EES149_GOLD_01" }
    }
  },
  n_veto: {
    en: {
      title: "Multi-Observatory Artificial-Satellite & Static-Sky Veto Engine",
      desc: "Propagates 11,899 live CelesTrak TLE constellations (Starlink, OneWeb, GEO) plus 16 Sun–Earth L2 probes via SGP4, verifies blank ForcedSourceOnDiaObject baselines, and cross-checks Gaia DR3, CatWISE2020, ASKAP 888 MHz, and 2000–2024 DECam/CFHT/PS1 archives.",
      fly: { category: "discoveries" }
    },
    zh: {
      title: "多波段人造航天器与静态天空否决引擎",
      desc: "通过 SGP4 实时传播 11,899 颗 CelesTrak 星座卫星（含 Starlink、OneWeb）及 16 艘 L2 深空探测器，检验非过境历元强迫测光零基线，并交叉核验 Gaia DR3、CatWISE2020、ASKAP 888 MHz 与 25 年历史光学档案。",
      fly: { category: "discoveries" }
    }
  },
  n_spherex: {
    en: {
      title: "NASA SPHEREx Pure-RAM S3 Range Engine & ESO ALMA Submillimeter Radiometry",
      desc: "Extracts 0.75–5.00 µm linear-variable-filter spectrophotometry directly from AWS S3 byte ranges, retaining bit-19 transient cometary/asteroid flux while rejecting bit-21 static blends under exact LEO spacecraft parallax, paired with ALMA Band 6/7 continuum sizing.",
      fly: { focus: "ATLAS_3I" }
    },
    zh: {
      title: "NASA SPHEREx 纯内存流式引擎与 ESO ALMA 亚毫米波热辐射测量",
      desc: "通过 AWS S3 字节范围请求直接提取 0.75–5.00 µm 分光测光，在近地轨道卫星视差校正下保留 bit-19 运动目标通量并剔除 bit-21 背景恒星混叠，联合 ALMA Band 6/7 热连续谱定标物理尺寸。",
      fly: { focus: "ATLAS_3I" }
    }
  },
  he_rubin: {
    en: {
      title: "Synthesis Hyperedge 1 — Full-Season Quadrature & Galactic Blind-Spot Locker",
      desc: "Extends DELTA_003 from 54.10 d to 124.83 d across intersecting Rubin detectors and isolates the Galactic-plane candidate EPS_002 inside dense Milky Way crowding at b = +7.1°. The independent audit grades both objects as plausible and in need of follow-up.",
      fly: { focus: "DELTA_003" }
    },
    zh: {
      title: "合成超边 1 — 全季东大距轨道坍缩与银道面盲区锁定器",
      desc: "将 DELTA_003 的观测弧从 54.10 天延伸至 124.83 天，并在 b = +7.1° 银道面密集星场中分离出候选体 EPS_002。独立审核将二者均评为“可信、尚待后续观测”。",
      fly: { focus: "DELTA_003" }
    }
  },
  he_stereo: {
    en: {
      title: "Synthesis Hyperedge 2 — Simultaneous 1.685M-km L2 × Chile Triangulator",
      desc: "Pairs simultaneous 2023-12-31 Euclid L2 (MPC 273) and CTIO Blanco 4-m DECam (MPC W84) exposures across a 1,685,391 km baseline. For EUC0005 and EUC0002 the audit verifies the Euclid detections and reproduces the DECam signals; the pair is graded plausible, and the quoted significances and fitted orbits are not supported.",
      fly: { focus: "EUC0005" }
    },
    zh: {
      title: "合成超边 2 — 168.5 万公里 L2 × 智利同步立体三角仪",
      desc: "联合 2023-12-31 Euclid L2 (273) 与智利 CTIO 4 米 DECam (W84) 的同步曝光，基线长 1,685,391 km。对于 EUC0005 与 EUC0002，独立审核核实了 Euclid 探测并复现了 DECam 信号；二者被评为可信候选体，此前引用的显著性与拟合轨道未获支持。",
      fly: { focus: "EUC0005" }
    }
  },
  he_euclid: {
    en: {
      title: "Synthesis Hyperedge 3 — Multi-ROS Sun–Earth L2 Streak & Slow-Mover Linker",
      desc: "Links the Euclid Ecliptic Survey fields and the deep fields under L2 light-time geometry. After the audit, {{asteroids}} short-arc asteroid candidates and {{euclid_tnos}} Euclid trans-Neptunian candidates survive; one linked track is the catalogued asteroid 2019 UM31, now the Euclid recovery control.",
      fly: { focus: "EUCLID_EES149_GOLD_18" }
    },
    zh: {
      title: "合成超边 3 — 多访次日地 L2 条纹与慢速运动源连接器",
      desc: "在 L2 光行时几何下连接 Euclid 黄道巡天视场与深场。经独立审核，保留 {{asteroids}} 颗短弧小行星候选体与 {{euclid_tnos}} 颗 Euclid 海王星外天体候选体；其中一条被连接的轨迹实为已编目小行星 2019 UM31，现作为 Euclid 回收对照。",
      fly: { focus: "EUCLID_EES149_GOLD_18" }
    }
  },
  he_spherex: {
    en: {
      title: "Synthesis Hyperedge 4 — Transient-Preserving Coma Spectroscopy",
      desc: "Combines clean SPHEREx exposures of moving targets with archival thermal data. The audit confirms CO and 12CO2 emission in interstellar comet 3I/ATLAS and CO emission in Centaur 29P/Schwassmann–Wachmann 1; the 13CO2 and water-ice detections claimed earlier are not supported.",
      fly: { focus: "SW1_29P" }
    },
    zh: {
      title: "合成超边 4 — 瞬变保留彗发分光",
      desc: "将运动目标的洁净 SPHEREx 曝光与档案热辐射数据相结合。独立审核确认星际彗星 3I/ATLAS 的 CO 与 12CO2 辐射以及半人马天体 29P/Schwassmann–Wachmann 1 的 CO 辐射；此前宣称的 13CO2 与水冰探测未获支持。",
      fly: { focus: "SW1_29P" }
    }
  },
  y_etno: {
    en: {
      title: "Audited Yield — {{group1_tnos}} Rubin and Tracklet-Archive TNO Candidates",
      desc: "{{group1_tnos}} trans-Neptunian candidates from Rubin DP2 and the Minor Planet Center tracklet archive survive the audit, led by DELTA_003 (fitted a = 156.6 AU, q = 35.78 AU, i = 3.16°), with DELTA_004, DELTA_009, DELTA_014, EPS_002, and EPS_007. All are candidates that await a Minor Planet Center designation.",
      fly: { focus: "DELTA_003" }
    },
    zh: {
      title: "审核后产出 — {{group1_tnos}} 颗 Rubin 与孤儿短弧库 TNO 候选体",
      desc: "来自 Rubin DP2 与小行星中心孤儿短弧库的 {{group1_tnos}} 颗海王星外天体候选体通过独立审核，以 DELTA_003（拟合 a = 156.6 AU，q = 35.78 AU，i = 3.16°）为首，另有 DELTA_004、DELTA_009、DELTA_014、EPS_002 与 EPS_007 等。全部为尚待小行星中心编号的候选体。",
      fly: { focus: "DELTA_003" }
    }
  },
  y_stereo: {
    en: {
      title: "Audited Yield — {{euclid_tnos}} Euclid Trans-Neptunian Candidates",
      desc: "{{euclid_tnos}} Euclid slow movers survive the audit as trans-Neptunian candidates: two with single-night DECam stereo counterparts (EUC0005, EUC0002), six in the COSMOS field (three graded verified), two in the ecliptic survey with unconstrained distances, and three in the deep fields. Fitted semimajor axes and eccentricities are not supported for any of them.",
      fly: { focus: "EUC0005" }
    },
    zh: {
      title: "审核后产出 — {{euclid_tnos}} 颗 Euclid 海王星外天体候选体",
      desc: "{{euclid_tnos}} 颗 Euclid 慢速运动源作为海王星外天体候选体通过独立审核：两颗具有单夜 DECam 立体视差对应体（EUC0005、EUC0002），六颗位于 COSMOS 场（其中三颗评为已核实），两颗位于黄道巡天且距离尚无约束，三颗位于深场。所有候选体的拟合半长轴与偏心率均未获支持。",
      fly: { focus: "EUC0005" }
    }
  },
  y_gold: {
    en: {
      title: "Audited Yield — {{asteroids}} Short-Arc Asteroid Candidates and the 2019 UM31 Control",
      desc: "{{asteroids}} Euclid asteroid candidates survive the audit: {{ees_asteroids}} ecliptic-field tracks seen in both VIS and NISP, two Jupiter-Trojan candidates and three outer-main-belt candidates in COSMOS, and seven deep-field tracks. Arcs shorter than a day give no orbit, size, or taxonomic class. EUCLID_EES149_GOLD_18 is the catalogued main-belt asteroid 2019 UM31 (a = 2.60 au) and serves as the recovery control.",
      fly: { focus: "EUCLID_EES149_GOLD_18" }
    },
    zh: {
      title: "审核后产出 — {{asteroids}} 颗短弧小行星候选体与 2019 UM31 回收对照",
      desc: "{{asteroids}} 颗 Euclid 小行星候选体通过独立审核：{{ees_asteroids}} 条同时出现在 VIS 与 NISP 中的黄道场轨迹、COSMOS 场中的两颗木星特洛伊候选体与三颗外主带候选体，以及七条深场轨迹。不足一天的弧段无法确定轨道、尺寸或光谱分类。EUCLID_EES149_GOLD_18 实为已编目主带小行星 2019 UM31（a = 2.60 au），现作为回收对照。",
      fly: { focus: "EUCLID_EES149_GOLD_18" }
    }
  },
  y_vol: {
    en: {
      title: "Audited Yield — Confirmed CO and CO2 Emission in 3I/ATLAS and CO in 29P/SW1",
      desc: "SPHEREx 0.75–5.00 µm coma spectra of interstellar comet 3I/ATLAS and active Centaur 29P/Schwassmann–Wachmann 1. The audit verifies CO (4.67 µm) and 12CO2 (4.26 µm) emission in 3I/ATLAS and CO emission in 29P, and it does not support the 13CO2 and water detections.",
      fly: { focus: "ATLAS_3I" }
    },
    zh: {
      title: "审核后产出 — 3I/ATLAS 的 CO 与 CO2 辐射及 29P/SW1 的 CO 辐射获确认",
      desc: "星际彗星 3I/ATLAS 与活跃半人马天体 29P/Schwassmann–Wachmann 1 的 SPHEREx 0.75–5.00 µm 彗发光谱。独立审核核实了 3I/ATLAS 的 CO（4.67 µm）与 12CO2（4.26 µm）辐射以及 29P 的 CO 辐射，不支持 13CO2 与水的探测。",
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
    name: "DELTA_003 (LSST-DP2-D03)",
    fovLabel: "110′ × 52′ Capricornus–Aquarius Ecliptic Field",
    raCenter: 348.36,
    decCenter: -8.09,
    spanDegRA: 1.85,
    spanDegDec: 0.88,
    starCount: 92,
    seed: 303,
    isStreak: false,
    note_en: "51.15 AU eTNO candidate · 12 hits / 124.83 d",
    note_zh: "51.15 AU 极端 TNO 候选体 · 12 次检出 / 124.83 天弧段",
    fly_en: "Fly to DELTA_003 in 3D ↗",
    fly_zh: "3D 飞抵 DELTA_003 ↗",
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
    name: "EPS_002 (Galactic Plane b = +7.12°)",
    fovLabel: "38′ × 18′ Sagittarius–Ophiuchus Crowded Milky Way Field",
    raCenter: 264.216,
    decCenter: -18.7625,
    spanDegRA: 0.68,
    spanDegDec: 0.042,
    starCount: 410,
    seed: 502,
    isStreak: false,
    note_en: "50.86 AU · TNO candidate in the Galactic plane",
    note_zh: "50.86 AU · 银道面海王星外天体候选体",
    fly_en: "Fly to EPS_002 in 3D ↗",
    fly_zh: "3D 飞抵 EPS_002 ↗",
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
    name: "2019 UM31 recovery control (EUC-G18, ROS 66276 VIS)",
    fovLabel: "68″ × 40″ Euclid VIS 0.10″/px Space Focal Plane",
    raCenter: 9.7623,
    decCenter: 5.0772,
    spanDegRA: 0.019,
    spanDegDec: 0.0115,
    starCount: 44,
    seed: 618,
    isStreak: true,
    paDeg: 57.4,
    note_en: "Known main-belt asteroid 2019 UM31 · recovery control · 54.5″/hr trail",
    note_zh: "已编目主带小行星 2019 UM31 · 回收对照 · 54.5″/h 拖尾",
    fly_en: "Fly to 2019 UM31 in 3D ↗",
    fly_zh: "3D 飞抵 2019 UM31 ↗",
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
    name: "EUC0005",
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
    fly_en: "Fly to EUC0005 in 3D ↗",
    fly_zh: "3D 飞抵 EUC0005 ↗",
    seed: 905
  },
  EUC0002: {
    focusId: "EUC0002",
    name: "EUC0002",
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
    fly_en: "Fly to EUC0002 in 3D ↗",
    fly_zh: "3D 飞抵 EUC0002 ↗",
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
    },
    "zh": {
      "claims": "一百五十七",
      "survivors": "九十三",
      "disputed": "十七",
      "eliminated": "六",
      "catalogued": "四十一",
      "ungraded": "零",
      "per_object": "五十六",
      "per_claim": "三十七",
      "verified": "四",
      "plausible": "八十九",
      "tnos": "四十六",
      "euclid_tnos": "十三",
      "group1_tnos": "三十三",
      "centaurs": "一",
      "moons": "三",
      "asteroids": "四十三",
      "ees_asteroids": "三十一",
      "controls": "二",
      "movie_targets": "九十六",
      "movie_discovery_targets": "九十四",
      "movie_controls": "二",
      "movie_frames": "三百八十八",
      "movie_single": "二百四十九",
      "movie_synthetic": "零",
      "movie_gaps": "零",
      "movie_no_epoch": "十二",
      "movie_galactic": "二十五",
      "ledger_rows": "一百五十四",
      "ledger_survivors": "九十三",
      "ledger_disputed": "十七",
      "ledger_known": "四十二",
      "ledger_volatile": "二",
      "ledger_group_etno": "三十五",
      "ledger_group_euclid_gold": "九十九",
      "ledger_group_moon_binary": "三",
      "ledger_group_stereo_kbo": "十五",
      "ledger_group_volatile": "二"
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
    "note_zh": "独立审核通过存在性宣称 I-D03-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-CORE-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-D09-01 评级：已核实。",
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
    "note_zh": "独立审核通过存在性宣称 I-CORE-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-E02-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-CORE-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核（EUC-S05）：可信，尚待后续观测。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（EUC-S02）：可信，尚待后续观测。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（EUC-V02）：可信，尚待后续观测。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（EUC-V03）：可信，尚待后续观测。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（EUC-G01）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G02）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G03）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G04）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G05）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G06）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G07）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G08）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G09）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G10）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G11）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G12）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G13）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G14）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G15）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G16）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G17）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G19）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G20）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G21）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G22）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G23）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G24）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G25）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G26）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G27）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G28）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G29）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G30）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G31）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-G32）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核通过存在性宣称 I-CORE-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-CORE-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-CORE-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-CORE-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核（EUC-CN01）：已核实。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（EUC-CS02）：已核实。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（EUC-CS03）：可信，尚待后续观测。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（EUC-CW04）：已核实。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（EUC-CW05）：可信，尚待后续观测。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（EUC-CW06）：可信，尚待后续观测。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（EUC-J01）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-J02）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-M03）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-M01）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（EUC-M02）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核通过存在性宣称 IV-I04-02、IV-I04-03 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-ITF-02 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-ITF-02 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-ITF-02 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-ITF-02 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-ITF-02 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 I-19-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核（C3_GOLD_01）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（C3_GOLD_02）：可信，尚待后续观测。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（C3_GOLD_04）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（C3_GOLD_05）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（C3_GOLD_06）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（C3_GOLD_07）：可信，尚待后续观测。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（C3_GOLD_09）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（C3_GOLD_11）：可信，尚待后续观测。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（C3_GOLD_13）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核（C3_GOLD_17）：可信，尚待后续观测。Euclid 运动源候选体；弧段不足一天，只能给出视运动与亮度，轨道、尺寸与光谱分类均未确定。",
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
    "note_zh": "独立审核通过存在性宣称 III-M01-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 III-M02-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核通过存在性宣称 III-M03-01 评级：可信，尚待后续观测。",
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
    "note_zh": "独立审核（C3_GOLD_15）：存疑或表述过度。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（C3_GOLD_16）：存疑或表述过度。Euclid 慢速运动源候选体；独立审核不支持表中的半长轴、偏心率与动力学分类，尚待后续观测。",
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
    "note_zh": "独立审核（SAT3_NEW_04）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_13）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_15）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_20）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_24）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_31）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_35）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_38）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_40）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_41）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_47）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_51）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_53）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_54）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "独立审核（SAT3_NEW_55）：存疑或表述过度。仅有 Rubin 探测的候选体，曾被表述为多卫星空间联合发现；其归属与新颖性未获独立审核认可。",
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
    "note_zh": "已编目天体 2019 UM31，作为回收对照保留；表中为该天体已发表的轨道根数，而非已撤回的短弧拟合。",
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
    "note_zh": "已编目天体 2021 QB98 的回收观测，作为回收对照保留，并非新发现；此处不列出其拟合轨道根数。",
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
    "note_zh": "已编目天体 2015 RP29 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 KH35 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 CO19 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2026 ET58 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 KK32 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 KN32 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 MV368 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 NG332 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 OF383 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 KG33 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2014 NR85 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2016 GB323 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 PJ276 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 WQ44 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 OL570 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 OU459 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2017 SD158 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2014 OF436 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2016 EG214 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2020 HQ103 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 KQ37 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 NP208 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2014 SM11 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2021 OJ20 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 OV363 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 QF201 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 OZ618 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 OP555 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 PL274 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2016 DZ43 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 PU178 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 ON705 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 KV35 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2019 KW50 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2020 PA67 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2020 UH50 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 OM380 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 LH4 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 LM5 的回收观测，并非新发现。",
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
    "note_zh": "已编目天体 2025 QJ106 的回收观测，并非新发现。",
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
    "note_zh": "独立审核：IV-SPX-01 已核实；IV-SPX-03 所述探测不成立或存疑。",
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
    "note_zh": "独立审核：IV-SPX-02 已核实；IV-SPX-03 所述探测不成立或存疑。",
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
let ledgerAudit = "all";
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
  query.set("lang", currentLang);
  // "http://localhost:8765" takes "/?query"; "../eyes_3d/index.html" takes "?query". Trailing
  // slashes are stripped first, so neither form can produce a double slash.
  const cleanBase = EYES_3D_BASE_URL.replace(/\/+$/, "");
  const sep = cleanBase.endsWith(".html") ? "?" : "/?";
  return `${cleanBase}${sep}${query.toString()}`;
}

function buildPlaygroundUrl(modelId = "") {
  const base = IS_LOCAL_BLOG_PORT
    ? `${window.location.protocol}//${window.location.hostname}:8765/studio.html`
    : "../eyes_3d/studio.html";
  const query = new URLSearchParams();
  if (modelId && modelId !== "1") query.set("model", modelId);
  query.set("lang", currentLang);
  return `${base}?${query.toString()}`;
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

function setLanguage(langCode, updateHistory = true) {
  const next = I18N[langCode] ? langCode : "en";
  currentLang = next;
  document.documentElement.lang = next === "zh" ? "zh-CN" : next;
  document.title = t("doc_title");

  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang-switch") === next);
  });

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && I18N[next][key] !== undefined) {
      el.textContent = fillAuditTokens(I18N[next][key], next);
    }
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key && I18N[next][key] !== undefined) {
      el.innerHTML = fillAuditTokens(I18N[next][key], next);
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key && I18N[next][key] !== undefined) {
      el.setAttribute("placeholder", fillAuditTokens(I18N[next][key], next));
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
    if (next === "en") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", next);
    }
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
  } catch (_) {}
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
      } catch (_) {}
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
    flyBtn.textContent = currentLang === "zh" ? cfg.fly_zh : cfg.fly_en;
    flyBtn.href = buildExplorerUrl({ focus: cfg.focusId });
  }
  document.querySelectorAll("[data-blink-epoch]").forEach((btn) => {
    const idx = Number(btn.getAttribute("data-blink-epoch"));
    btn.textContent = currentLang === "zh" ? `历元 ${idx + 1}` : `Epoch ${idx + 1}`;
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
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillText(`E${blinkEpochIdx + 1}: ${ep.utc.slice(0, 16)}`, tPt.x + rOut + 8, tPt.y - 5);
  }

  // Frame Border & Axis Tick Readouts
  ctx.strokeStyle = "rgba(160, 182, 212, 0.38)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(plot.x, plot.y, plot.w, plot.h);

  ctx.fillStyle = "#c8d6ea";
  ctx.font = '600 11.5px "Inter", sans-serif';
  ctx.fillText(`${cfg.name}  —  ${cfg.fovLabel}`, plot.x, 22);

  if (blinkDiffMode) {
    ctx.fillStyle = "#44c493";
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillText(t("cv_diff_on"), plot.x + plot.w - 310, 22);
  }

  // RA / Dec Corner Labels & N/E Compass
  ctx.fillStyle = "#8ea2be";
  ctx.font = '10.5px "JetBrains Mono", monospace';
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
  ctx.font = '600 9.5px "JetBrains Mono", monospace';
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
  if (elNote) elNote.textContent = currentLang === "zh" ? cfg.note_zh : cfg.note_en;

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
    flyBtn.textContent = currentLang === "zh" ? cfg.fly_zh : cfg.fly_en;
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
  ctx.font = '600 10.5px "JetBrains Mono", monospace';
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
  ctx.font = '700 11px "JetBrains Mono", monospace';
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
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText("30″", sbX + px30 * 0.35, sbY - 6);

  ctx.strokeStyle = "rgba(160, 182, 212, 0.38)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(sBox.x, sBox.y, sBox.w, sBox.h);

  ctx.fillStyle = "#c8d6ea";
  ctx.font = '600 11px "Inter", sans-serif';
  ctx.fillText(t("cv_sky_view"), sBox.x, 23);
  ctx.fillStyle = "#44c493";
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText(t("cv_epipolar"), sBox.x, cssH - 10);

  /* --- RIGHT PANEL: Top-Down Heliocentric Stereoscopic Geometry --- */
  const gBox = { x: splitX + 10, y: 38, w: cssW - splitX - 28, h: cssH - 66 };
  ctx.fillStyle = "#080d16";
  ctx.fillRect(gBox.x, gBox.y, gBox.w, gBox.h);
  ctx.strokeStyle = "rgba(160, 182, 212, 0.32)";
  ctx.strokeRect(gBox.x, gBox.y, gBox.w, gBox.h);

  ctx.fillStyle = "#c8d6ea";
  ctx.font = '600 11px "Inter", sans-serif';
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
  ctx.font = '10px "Inter", sans-serif';
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
  ctx.font = '700 11.5px "JetBrains Mono", monospace';
  ctx.fillStyle = "#63a4f4";
  ctx.fillText(`${cfg.name}: d_L2 = ${cfg.dL2Au.toFixed(2)} ± ${cfg.dErrAu.toFixed(2)} AU`, gBox.x + 18, tnoY - 16);

  ctx.fillStyle = "#b8c7dc";
  ctx.font = '10.5px "JetBrains Mono", monospace';
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
      const note = (currentLang === "zh" ? r.note_zh : r.note_en) || "";
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

/* ==========================================================================
   12. Bootstrap on DOMContentLoaded
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initBlinkWidget();
  initStereoWidget();
  initHypergraph();
  initLedger();
  initLightboxAndGifs();
  initScrollSpy();

  // Language switcher buttons
  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguage(btn.getAttribute("data-lang-switch"), true);
    });
  });

  // Default strictly to 100% pure English ("en"), honoring ?lang=zh or ?lang=en
  const urlParams = new URLSearchParams(window.location.search);
  const reqLang = (urlParams.get("lang") || "en").toLowerCase();
  const initialLang = I18N[reqLang] ? reqLang : "en";
  setLanguage(initialLang, false);

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
