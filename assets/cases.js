/* SciTestBench: failure-case explorer (cases.html) */
/* ---------- code highlighting ---------- */
const KW={py:"def|assert|import|from|return|for|in|if|else|None|True|False|dict|lambda|class|self",
  cpp:"void|const|double|int|for|if|else|return|true|false|new|sizeof|auto|std|State|Vec3|vector"};
function hl(src,lang){
  const com=lang==="py"?"#.*":"\\/\\/.*";
  const re=new RegExp(`(${com})|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')|\\b(\\d+(?:\\.\\d+)?(?:e[-+]?\\d+)?)\\b|\\b(${KW[lang]})\\b`,"g");
  return src.split("\n").map(line=>{let out="",last=0;line.replace(re,(m,c,s,n,k,off)=>{out+=esc(line.slice(last,off));
    out+=`<span class="tk-${c?"c":s?"s":n?"n":"k"}">${esc(m)}</span>`;last=off+m.length;return m});return out+esc(line.slice(last))});
}
function codebox(c){
  const lines=hl(c.src,c.lang),H=new Set(c.hl||[]);
  return `<div class="codebox"><div class="bar2"><span class="dots"><i></i><i></i><i></i></span><span>${c.file}</span><span>${c.lang==="py"?"Python":"C++"}</span></div><pre>${lines.map((l,i)=>`<span class="ln${H.has(i+1)?" hl":""}" data-n="${i+1}">${l||" "}</span>`).join("")}</pre></div>${c.cap?`<p class="codecap">${c.cap}</p>`:""}`;
}

/* ---------- case explorer ---------- */
const CASES=[
{id:"OpenMM-5242",g:"issue",st:"mix",short:"Energy minimization",tags:[["g","F&rarr;P: GPT-6.1 Sol"],["r","Base not fail: Opus 5.5, GPT-6 Astra"]],
 title:"A small gradient does not establish a minimum",
 lesson:"Spotting a precision issue is not enough without an input that reaches the target behavior and an oracle that identifies the minimum.",
 body:`In single precision, comparing two large absolute energies can erase the small decrease the line search requires. All three agents identified the precision problem and added a constant energy offset <i>C</i>&nbsp;=&nbsp;10<sup>8</sup>. Only GPT-6.1 Sol built a quartic potential <i>V</i>(<i>x</i>)&nbsp;=&nbsp;100(<i>z</i><sup>4</sup>&minus;<i>z</i><sup>2</sup>), <i>z</i>&nbsp;=&nbsp;&radic;2<i>x</i>&minus;1, whose first trial step lands on a stationary <b>maximum</b>. Float32 spacing near <i>C</i> is 8, while the line search needs &Delta;<i>E</i>&nbsp;&le;&nbsp;&minus;0.04, so the buggy minimizer accepts the step. A gradient-only oracle also accepts the maximum. The energy oracle <i>E</i>&nbsp;&minus;&nbsp;<i>C</i>&nbsp;&asymp;&nbsp;&minus;50 rejects it.`,
 code:{file:"Generated test (abbreviated) · GPT-6.1 Sol",lang:"cpp",hl:[3,4],src:`LocalEnergyMinimizer::minimize(context, 1.0, 100);
State state = context.getState(State::Energy);
ASSERT_EQUAL_TOL(-50.0,
    state.getPotentialEnergy()-1e8, 1e-4);`,cap:"System construction and other assertions omitted."},
 ev:`<h4>Test designs, identical prompt</h4><table><thead><tr><th>Agent</th><th>Input</th><th>Key oracle</th><th>Result</th></tr></thead><tbody>
 <tr><td>Opus 5.5</td><td>400 dimers; harmonic wells</td><td>Projected residual force</td><td><span class="tag r">Base not fail</span></td></tr>
 <tr><td>GPT-6 Astra</td><td>Two particles; Rosenbrock potential</td><td>Tangential force</td><td><span class="tag r">Base not fail</span></td></tr>
 <tr><td>GPT-6.1 Sol</td><td>Two particles; quartic potential</td><td>Residual force and <i>E</i>&minus;<i>C</i>&asymp;&minus;50</td><td><span class="tag g">F&rarr;P</span></td></tr></tbody></table>`},
{id:"OpenMM-2318",g:"issue",st:"bad",short:"Nonbonded exceptions",tags:[["r","Gold not pass"],["a","Incorrect scientific premise"]],
 title:"A physical equivalence that does not hold under a cutoff",
 lesson:"Incorrect scientific assumptions can produce invalid tests even when the test code is correct.",
 body:`GPT-6.1 Sol assumed that replacing a nonbonded interaction with an exception that uses the same parameters should preserve the energy. Under a cutoff, however, regular interactions include <b>reaction-field corrections</b>, while exceptions use plain Coulomb interactions. The two energies differ (&minus;7.67 vs. &minus;130.27&nbsp;kJ/mol), so the test fails even after the bug is fixed.`,
 code:{file:"tests/TestNonbondedForce.h · GPT-6.1 Sol",lang:"cpp",hl:[6,7,11],src:`const NonbondedForce::NonbondedMethod methods[] = {NonbondedForce::NoCutoff,
    NonbondedForce::CutoffNonPeriodic, NonbondedForce::CutoffPeriodic, NonbondedForce::PME};
// ...
State original = context.getState(State::Energy | State::Forces);

// Replacing a pair by an exception with the same combined parameters
// should preserve its energy and forces, including when using a cutoff.
nonbonded->addException(0, 1, 0.5*(-1.5), 0.5*(0.3+0.4), sqrt(0.5*0.8));
context.reinitialize(true);
State withException = context.getState(State::Energy | State::Forces);
ASSERT_EQUAL_TOL(original.getPotentialEnergy(), withException.getPotentialEnergy(), TOL);`,cap:"Excerpt of the submitted patch. The highlighted premise is invalid for the cutoff methods."},
 ev:`<h4>Energy under a cutoff (kJ/mol)</h4><div class="cmp"><div><span>Regular interaction</span><b>&minus;7.67</b><p>includes reaction-field correction</p></div><div><span>Exception, same parameters</span><b>&minus;130.27</b><p>plain Coulomb interaction</p></div></div>`},
{id:"LAMMPS-5042",g:"issue",st:"bad",short:"Dipolar spin energy",tags:[["r","Gold not pass"],["a","Over-strict tolerance"]],
 title:"A tolerance that rejects the fix",
 lesson:"Choosing a scientifically appropriate numerical tolerance is itself a scientific decision.",
 body:`The generated test compares two-spin dipolar energies against an analytic expression and allows 0.5% of the dipolar energy scale. The fixed code still has a 0.9% error, <b>even though the fix substantially improves accuracy</b>, so the test rejects the corrected implementation.`,
 code:{file:"unittest/force-styles/test_pair_spin_dipole.cpp · GPT-6.1 Sol",lang:"cpp",hl:[7,8,9],src:`// E = mu_0 * mu_B^2 / (4*pi*r^3) * (s1.s2 - 3*s1x*s2x), in eV.
const double energy_scale = 784.15 * 9.274e-4 * 9.274e-4 / (4.0 * pi * 8.0);
// ...
lammps_command(lmp, "kspace_style ewald/dipole/spin 1.0e-8");
// ...
const double energy = lammps_get_thermo(lmp, "pe");
// Allow 0.5% of the dipolar scale for periodic images and
// the numerical accuracy of the long-range calculation.
EXPECT_NEAR(energy, expected, 0.005 * energy_scale);`,cap:"Excerpt of the submitted patch; <code>// ...</code> marks omitted lines."},
 ev:`<h4>Relative error vs. test tolerance</h4><div class="gauge"><div class="axis"></div><div class="ok" style="width:41.7%"></div>
 <div class="mk" style="left:41.7%;background:var(--green)"><span style="color:var(--green)">tolerance 0.5%</span></div>
 <div class="mk" style="left:75%;background:var(--red)"><span style="color:var(--red)">fixed code 0.9%</span></div>
 <span class="tick" style="left:0">0%</span><span class="tick" style="left:83.3%">1.0%</span></div>`},
{id:"OpenMM-1540",g:"issue",st:"bad",short:"Near-contact Coulomb",tags:[["r","Gold not pass"],["a","Mechanism mismatch"]],
 title:"A real failure, but the wrong mechanism",
 lesson:"Agents can expose a genuine failure while misidentifying the mechanism of the reported defect.",
 body:`The generated test places two charges 10<sup>&minus;7</sup>&nbsp;nm apart and asserts a finite analytic Coulomb energy, targeting a <b>near-contact Coulomb NaN</b>. The reference fix instead adds a guard in a <b>generalized-Born</b> force. The test still fails after the fix. RDKit-7814 shows the same pattern: a genuine NaN in an out-of-plane term, while the fix changes a torsion calculation.`,
 code:{file:"platforms/cpu/tests/TestCpuNonbondedForce.cpp · GPT-6.1 Sol",lang:"cpp",hl:[7,10,11],src:`void testCloseContact() {
    // Averaged coordinates can put atoms with no Lennard-Jones interaction
    // very close together.  Their Coulomb energy and forces are still finite.
    // ...
    nonbonded->setNonbondedMethod(NonbondedForce::NoCutoff);
    // ...
    const double r = 1e-7;
    positions[1] = Vec3(r, 0, 0);
    State state = context.getState(State::Energy | State::Forces);
    double energy = ONE_4PI_EPS0*(-0.75)/r;
    ASSERT_EQUAL_TOL(energy, state.getPotentialEnergy(), TOL);`,cap:"Excerpt of the submitted patch."},
 ev:`<h4>Test target vs. reference fix</h4><div class="cmp"><div><span>Generated test exercises</span><b style="font-size:18px">Coulomb at near contact</b><p>NonbondedForce, NoCutoff</p></div><div><span>Reference fix repairs</span><b style="font-size:18px">Generalized-Born guard</b><p>a different force term</p></div></div>`},
{id:"PySCF-1164",g:"issue",st:"ok",short:"Electron number",tags:[["g","F&rarr;P: both agents"],["b","Stronger oracle"]],
 title:"An oracle that constrains physical meaning",
 lesson:"Two tests can both reproduce the failure and still differ in how much scientific meaning they enforce.",
 body:`The issue concerns a H&uuml;ckel initial density matrix built with Cartesian basis functions. Both GPT-6.1 Sol and GPT-6 Astra write water-molecule tests in the affected basis and achieve F&rarr;P. GPT-6.1 Sol checks only the matrix shape. GPT-6 Astra also requires <b>Tr(<i>DS</i>)&nbsp;=&nbsp;<i>N</i><sub>e</sub></b>, which accounts for the nonorthogonal basis and constrains the physical meaning of the result.`,
 code:{file:"pyscf/scf/test/test_rhf.py · GPT-6 Astra",lang:"py",hl:[6,7],src:`def test_init_guess_huckel_cart(self):
    mol1 = gto.M(atom='O 0 0 0; H 0 -0.757 0.587; H 0 0.757 0.587',
                 basis='6-31g*', cart=True, verbose=0)
    dm = scf.RHF(mol1).get_init_guess(key='huckel')
    self.assertEqual(dm.shape, (mol1.nao_nr(), mol1.nao_nr()))
    self.assertAlmostEqual(numpy.einsum('ij,ji->', dm, mol1.intor('int1e_ovlp')),
                           mol1.nelectron, 9)`,cap:"Highlighted lines (the electron-count oracle) appear only in GPT-6 Astra's test; GPT-6.1 Sol stops after the shape check."}},
{id:"Scanpy-1464",g:"issue",st:"ok",short:"Marker rankings",tags:[["g","F&rarr;P"],["b","Targeted biological input"]],
 title:"Isolating the defect without the full workflow",
 lesson:"A targeted synthetic input can isolate the biological meaning of a result.",
 body:`The issue reports identical marker-overlap scores across cell clusters. The agents rank the same 200 genes in opposite orders for two clusters, with the reference markers at opposite ends, and require each marker to favor the cluster where it ranks highly. The buggy default uses all genes, which erases the ranking distinction; the fix restricts it to the top 100 markers.`,
 code:{file:"scanpy/tests/test_marker_gene_overlap.py · GPT-6 Astra",lang:"py",hl:[6,12,13],src:`adata = AnnData(X=np.ones((2, 200)))
genes = [f'gene_{i}' for i in range(200)]
adata.var_names = genes
# Full rankings contain the same genes, but opposite cluster markers.
adata.uns['rank_genes_groups'] = {
    'names': np.rec.fromarrays([genes, genes[::-1]], names='c0,c1'),
}
marker_genes = {'type 1': {genes[0]}, 'type 2': {genes[-1]}}

overlap = sc.tl.marker_gene_overlap(adata, marker_genes)

assert overlap.loc['type 1', 'c0'] > overlap.loc['type 1', 'c1']
assert overlap.loc['type 2', 'c1'] > overlap.loc['type 2', 'c0']`,cap:"Test body excerpt; GPT-6.1 Sol's test is equivalent. Each marker must favor the cluster where it ranks highly."}},
{id:"ObsPy",g:"san",st:"ok",short:"Seismic correlation",tags:[["g","Sanitizer triggered"],["a","Maintainer-confirmed"]],
 title:"Generic validity checks accept a wrong answer",
 lesson:"Checking output validity alone can miss scientific errors; a scientific invariant catches them.",
 body:`The agent's test checks that normalized cross-correlation has the correct shape, finite values and coefficients bounded by 1, and these checks <b>accept an all-zero output</b>. Scientifically, scaling a signal by a positive gain must not change its normalized correlation. The gain-invariance sanitizer exposes the violation for small signals. The cause is that the implementation compares a signal-dependent normalization factor, which has squared-signal units, against a dimensionless machine epsilon.`,
 code:{file:"Independent reproduction (no instrumentation)",lang:"py",hl:[6],src:`a = np.linspace(-1, 1, 31) * 3e-9
b = np.cos(np.arange(31)) * 3e-9
kw = dict(demean=False, normalize="naive")
c1 = correlate(a, b, 10, **kw)
c2 = correlate(2*a, b, 10, **kw)
np.testing.assert_allclose(c1, c2, atol=1e-12)`,cap:"Imports omitted; the final assertion fails."},
 ev:`<h4>Max |coefficient|, amplitude 3&times;10<sup>&minus;9</sup></h4><div class="cmp"><div><span>correlate(a, b)</span><b>0</b><p>zeroed below the epsilon threshold</p></div><div><span>correlate(2a, b)</span><b>&asymp; 0.121</b><p>should be identical</p></div></div>`},
{id:"Biopython",g:"san",st:"mix",short:"Codon adaptation",tags:[["g","Triggered: GPT-6.1 Sol"],["r","Missed: Sonnet 5.5"],["a","Maintainer-confirmed"]],
 title:"The right configuration, an uninformative input",
 lesson:"Knowing the alternative genetic code is not enough unless the input makes its consequence observable.",
 body:`The codon adaptation index drops ATG and TGG from its geometric mean as fixed-weight codons. Under genetic code table 4, TGA also encodes tryptophan, so TGG's weight depends on the reference set. Both Sonnet 5.5 and GPT-6.1 Sol use this alternative code, but Sonnet's reference set gives TGG weight 1, which <b>masks</b> the faulty shortcut. GPT-6.1 Sol constructs equal-weight synonymous codons whose substitution should preserve the index, and the library returns 0.316 and 0.100.`,
 code:{file:"Independent reproduction (no instrumentation)",lang:"py",hl:[5],src:`table = unambiguous_dna_by_id[4]
ref = ["ATG" + "TGA" * 8 + "TGG" + "TAA"]
cai = CodonAdaptationIndex(ref, table=table)
assert cai["TGG"] == 0.125
assert cai.calculate("ATGAAATGGTAA") < 1.0`,cap:"TGG has weight 0.125, but the final assertion fails: the index is 1.0."}},
{id:"Nilearn",g:"san",st:"ok",short:"z-score baseline",tags:[["b","Sanitizer-derived"],["a","Maintainer-confirmed"]],
 title:"A stale cache reverses a statistical conclusion",
 lesson:"A routine cache error can change the scientific interpretation of a statistical test.",
 body:`With estimated effect 2, variance 1 and 40 degrees of freedom, <code>Contrast.z_score(baseline=3)</code> must be negative. After an earlier query against baseline 0, the same object returns approximately <b>+1.940</b>, whereas a fresh object returns <b>&minus;0.988</b>. The implementation keeps a cached lower-tail probability from the previous baseline. A sign oracle and a fresh-object comparison expose the mismatch, and the values stay finite throughout.`,
 ev:`<h4>Signed z-score against baseline 3</h4><div class="nl"><div class="axis"></div><div class="zero" style="left:50%"></div>
 <div class="pt dn" style="left:${50-0.988/2.5*50}%;background:var(--green)"><span style="color:var(--green)">fresh &minus;0.988</span></div>
 <div class="pt up" style="left:${50+1.940/2.5*50}%;background:var(--red)"><span style="color:var(--red)">reused +1.940</span></div>
 <span class="t" style="left:0">&minus;2.5</span><span class="t" style="left:50%">0</span><span class="t" style="left:100%">+2.5</span></div>`},
{id:"yt",g:"san",st:"ok",short:"Cosmological distance",tags:[["b","Scientific check"],["a","Finite but inaccurate"]],
 title:"Plausible magnitude, valid units, wrong value",
 lesson:"Scientific invariants catch finite but inaccurate outputs that exception and NaN checks cannot.",
 body:`At the pinned revision, <code>Cosmology.trapezoid_int</code> omits the final integration interval. The result has plausible magnitude and valid units, so exception and non-finite-value checks cannot tell it apart from the corrected result. Only comparison against independent quadrature exposes it.`,
 ev:`<h4>Comoving radial distance, z = 0 &rarr; 1 (Mpc)</h4><div class="cmp"><div><span>yt (pinned revision)</span><b>3317.06282</b></div><div><span>Independent quadrature</span><b>3317.40718</b></div></div><p class="codecap">Absolute discrepancy &asymp; 0.34436 Mpc.</p>`}
];
const list=$("#cxList"),panel=$("#cxPanel");
list.innerHTML=`<h4>Issue reproduction</h4>`+CASES.filter(c=>c.g==="issue").map(btn).join("")+`<h4>Sanitizer-guided</h4>`+CASES.filter(c=>c.g==="san").map(btn).join("");
function btn(c){return `<button role="tab" data-id="${c.id}"><span class="d ${c.st}"></span><span>${c.id}<small>${c.short}</small></span></button>`}
function showCase(id){
  const c=CASES.find(x=>x.id===id);
  $$("#cxList button").forEach(b=>{const on=b.dataset.id===id;b.classList.toggle("on",on);b.setAttribute("aria-selected",on)});
  panel.style.animation="none";panel.offsetHeight;panel.style.animation="";
  panel.innerHTML=`<div class="cx-top"><span class="cx-id">${c.g==="issue"?"ISSUE REPRODUCTION":"SANITIZER-GUIDED"} &middot; ${c.id}</span><span class="pill-row" style="margin:0">${c.tags.map(([k,t])=>`<span class="tag ${k}">${t}</span>`).join("")}</span></div>
   <h3>${c.title}</h3><p class="cx-lesson">${c.lesson}</p><div class="cx-body"><p>${c.body}</p></div>${c.code?codebox(c.code):""}${c.ev?`<div class="ev">${c.ev}</div>`:""}`;
}
list.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;showCase(b.dataset.id);try{history.replaceState(null,"","#case-"+b.dataset.id)}catch(_){}});
const h0=decodeURIComponent(location.hash.slice(6));
showCase(location.hash.startsWith("#case-")&&CASES.some(c=>c.id===h0)?h0:"OpenMM-5242");
if(location.hash.startsWith("#case-"))addEventListener("load",()=>$(".cx").scrollIntoView());
