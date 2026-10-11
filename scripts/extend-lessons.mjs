// Canonical additions; run before build-learning.mjs. Existing lessons are preserved.
import fs from 'node:fs';
const items={
zh:[{
id:'column',number:'05',label:'从变形到失稳',title:'细杆能承受多大的压力？',
problem:'同样一根杆，侧向受力会弯曲，轴向受压则可能失稳。这次求它开始侧弯的临界载荷。',
prompt:'请用 AgentFEM 分析钢压杆的线性屈曲：长 200 mm，截面高 10 mm、厚 10 mm，弹性模量 210 GPa、泊松比 0.3。采用二维平面应力，左端固定，右端面均布轴向压力，参考总力 100 N，其余边界自由，忽略重力。先计算预应力，再求第一阶临界载荷（N）和屈曲模态图。用悬臂压杆欧拉公式核对，注明模态幅值不是实际位移。',
expect:'一张第一阶屈曲模态图，以及对应的临界载荷。',result:'参考临界载荷：10.779 kN',
read:'欧拉公式给出 10.795 kN，两者相差约 0.14%。图中显示的是失稳形状，不能据此读出压杆实际弯了多少。',
follow:'把杆长改成 400 mm，截面、材料和约束不变，再计算第一阶临界载荷。比较两次结果的比值，并用欧拉公式解释。',
takeaway:'长度加倍，临界载荷约为原来的四分之一。细长杆的承载能力不只取决于材料强度。',
technical:'需要包含 2026-10-10 屈曲功能更新的 AgentFEM 与 SLEPc；早于该更新的 v0.4.1 不包含此功能。参考模型采用二次单元、80×6 网格，100 N 按 10×10 mm² 截面换算为 1 MPa。结果限于理想弹性压杆的线性屈曲，不是后屈曲承载力。',
imageAlt:'压杆原形与第一阶屈曲模态，临界载荷10.779千牛，模态幅值仅用于显示。'
},{
id:'honeycomb',number:'06',label:'让几何改变性能',title:'为什么它越拉越宽？',
problem:'实心板被拉长时通常会变窄。换成内凹蜂窝，使用相同材料，它却可以同时变宽。先下载网格包，解压后把文件夹交给 AI 助手。',
prompt:'请用 AgentFEM 导入附件 honeycomb.msh，不重新绘制几何。坐标单位为米，宽 51.9615 mm、高 60 mm；边界标签 11/12/13/14 分别为左/右/下/上。采用二维平面应力、小变形线弹性，E=1 GPa、泊松比 0.3，忽略重力。左侧水平位移为零，右侧水平拉伸宽度的 0.1%，竖向自由，仅固定左下角竖向位移。用四侧边界平均位移计算轴向、横向应变及表观泊松比。与相同尺寸、材料和约束的实心板对比，给一张变形图并注明放大倍数。',
expect:'蜂窝与实心板的变形对比图、轴向和横向应变、各自的表观泊松比。',result:'蜂窝约 −1.30；实心板 0.30',
read:'两者都被水平拉长，蜂窝竖向展开，实心板竖向收缩。负泊松比来自结构形状，材料本身的泊松比仍是 0.3。',
follow:'将蜂窝和实心板的水平拉伸量都减半，其他条件不变。比较两次表观泊松比，解释为什么位移减小了，比例却基本不变。',
takeaway:'在线性小变形范围内，表观泊松比基本不随拉伸量变化。它描述的是这块试样的整体响应。',
technical:'附件含基准网格、加密网格、边界说明和几何生成脚本。斜肋长 10 mm、竖肋长 15 mm、肋宽 1.2 mm、夹角 −30°，3×3 个矩形周期，已去除边缘孤立片段。使用二次位移单元；表观泊松比为负的横向应变与轴向应变之比，不等同于无限周期材料的有效泊松比。',
imageAlt:'相同水平拉伸下，实心板竖向收缩，内凹蜂窝竖向展开；位移放大50倍。'
}],
en:[{
id:'column',number:'05',label:'From deformation to instability',title:'How much compression can a slender column carry?',
problem:'A lateral force bends a bar. Axial compression can make it buckle. Find the load at which sideways buckling begins.',
prompt:'Use AgentFEM for linear buckling of a steel column: length 200 mm, section height 10 mm and thickness 10 mm, Young’s modulus 210 GPa, Poisson’s ratio 0.3. Use 2D plane stress. Clamp the left end and apply uniform axial compression to the right face with a reference total force of 100 N; leave other boundaries free and neglect gravity. Solve the prestress state, then report the first critical load (N) and mode plot. Check against Euler’s cantilever-column formula and state that mode amplitude is not physical displacement.',
expect:'The first buckling mode and its critical load.',result:'Reference critical load: 10.779 kN',
read:'Euler’s formula gives 10.795 kN, a difference of about 0.14%. The plot shows the instability shape, not the actual deflection under a given force.',
follow:'Increase the column length to 400 mm, keeping the section, material and supports unchanged. Recompute the first critical load, compare the two loads and explain their ratio using Euler’s formula.',
takeaway:'Doubling the length reduces the critical load to approximately one quarter. Material strength alone does not determine the capacity of a slender column.',
technical:'Requires AgentFEM with the buckling update merged on 2026-10-10 and SLEPc. The earlier v0.4.1 release lacks this feature. Reference: quadratic elements, 80×6 mesh, 100 N over 10×10 mm² gives 1 MPa. Linear elastic buckling of an ideal column is not postbuckling capacity.',
imageAlt:'Original column and first buckling mode; critical load 10.779 kN. Mode amplitude is for display only.'
},{
id:'honeycomb',number:'06',label:'Geometry changes the response',title:'Why does it get wider when stretched?',
problem:'A solid plate usually narrows when stretched. A re-entrant honeycomb made of the same material can widen. Download and unzip the mesh pack, then give the folder to your AI assistant.',
prompt:'Use AgentFEM to import the attached honeycomb.msh without redrawing the geometry. Coordinates are in metres; width 51.9615 mm, height 60 mm. Boundary tags 11/12/13/14 mean left/right/bottom/top. Use small-strain linear elasticity in 2D plane stress, E=1 GPa and Poisson’s ratio 0.3; neglect gravity. Fix horizontal displacement on the left and impose a horizontal extension of 0.1% of the width on the right. Leave vertical motion free except for the bottom-left vertical displacement. Use mean displacements on all four boundaries to calculate axial and transverse strains and apparent Poisson’s ratio. Compare with a solid plate of the same size, material and constraints. Show one deformation comparison plot with its magnification.',
expect:'Deformed honeycomb and solid plate, their axial and transverse strains, and apparent Poisson’s ratios.',result:'Honeycomb about −1.30; solid plate 0.30',
read:'Both extend horizontally; the honeycomb expands vertically while the plate contracts. The negative ratio comes from geometry: the constituent material still has Poisson’s ratio 0.3.',
follow:'Halve the imposed horizontal extension for both specimens, leaving all other settings unchanged. Compare the apparent Poisson’s ratios and explain why displacement decreases but the ratio barely changes.',
takeaway:'Within small-strain linear elasticity, the apparent Poisson’s ratio is essentially independent of the imposed extension. It describes this finite specimen’s overall response.',
technical:'The pack contains baseline and refined meshes, boundary definitions and a geometry generator. Inclined ligament 10 mm, vertical ligament 15 mm, wall width 1.2 mm, angle −30°, 3×3 rectangular periods; disconnected boundary fragments are removed. Use quadratic displacement elements. Apparent Poisson’s ratio is minus transverse strain divided by axial strain, not the effective ratio of an infinite periodic material.',
imageAlt:'At equal horizontal strain, the solid plate contracts vertically and the re-entrant honeycomb expands; displacement magnified 50 times.'
}],
fr:[{
id:'column',number:'05',label:'De la déformation à l’instabilité',title:'Quelle compression une tige élancée peut-elle supporter ?',
problem:'Une force latérale courbe une tige. Une compression axiale peut la faire flamber. Cherchez la charge critique de cette instabilité.',
prompt:'Avec AgentFEM, étudiez le flambement linéaire d’une tige en acier : longueur 200 mm, section de hauteur 10 mm et d’épaisseur 10 mm, module d’Young 210 GPa et coefficient de Poisson 0,3. Utilisez les contraintes planes 2D. Encastrez l’extrémité gauche et appliquez sur la face droite une compression axiale uniforme de force totale de référence 100 N. Les autres bords sont libres ; négligez la pesanteur. Calculez la précontrainte, puis la première charge critique (N) et son mode. Comparez à la formule d’Euler pour une tige encastrée-libre. Précisez que l’amplitude du mode n’est pas un déplacement réel.',
expect:'Le premier mode de flambement et sa charge critique.',result:'Charge critique de référence : 10,779 kN',
read:'La formule d’Euler donne 10,795 kN, soit environ 0,14 % d’écart. La figure montre la forme d’instabilité, pas la déflexion réelle sous une force donnée.',
follow:'Portez la longueur à 400 mm sans modifier la section, le matériau ni les appuis. Recalculez la première charge critique et expliquez le rapport des charges avec la formule d’Euler.',
takeaway:'Doubler la longueur divise approximativement la charge critique par quatre. La résistance du matériau ne suffit pas à déterminer la capacité d’une tige élancée.',
technical:'Nécessite AgentFEM avec la mise à jour de flambement intégrée le 10 octobre 2026 et SLEPc. La version antérieure v0.4.1 ne contient pas cette fonction. Référence : éléments quadratiques, maillage 80×6 ; 100 N sur 10×10 mm² donnent 1 MPa. Le flambement linéaire élastique ne détermine pas la capacité postcritique.',
imageAlt:'Tige initiale et premier mode de flambement ; charge critique 10,779 kN. Amplitude uniquement illustrative.'
},{
id:'honeycomb',number:'06',label:'La géométrie change la réponse',title:'Pourquoi s’élargit-il quand on l’étire ?',
problem:'Une plaque pleine se rétrécit généralement en traction. Un nid d’abeilles rentrant du même matériau peut s’élargir. Téléchargez et décompressez les fichiers, puis transmettez le dossier à votre assistant IA.',
prompt:'Avec AgentFEM, importez le fichier joint honeycomb.msh sans redessiner la géométrie. Les coordonnées sont en mètres ; largeur 51,9615 mm, hauteur 60 mm. Les étiquettes 11/12/13/14 désignent gauche/droite/bas/haut. Utilisez l’élasticité linéaire en petites déformations et contraintes planes 2D : E=1 GPa, coefficient de Poisson 0,3 ; négligez la pesanteur. Bloquez le déplacement horizontal à gauche et imposez à droite un allongement horizontal de 0,1 % de la largeur. Le mouvement vertical est libre, sauf au coin inférieur gauche. Calculez les déformations axiale et transversale et le coefficient de Poisson apparent à partir des déplacements moyens des quatre bords. Comparez à une plaque pleine de mêmes dimensions, matériau et appuis. Donnez une figure comparative avec le facteur d’amplification.',
expect:'Les déformées du nid d’abeilles et de la plaque, leurs déformations axiale et transversale et leurs coefficients de Poisson apparents.',result:'Nid d’abeilles environ −1,30 ; plaque 0,30',
read:'Les deux s’allongent horizontalement. Le nid d’abeilles s’étend verticalement, la plaque se contracte. Le coefficient négatif vient de la géométrie ; celui du matériau reste égal à 0,3.',
follow:'Divisez par deux l’allongement horizontal imposé aux deux éprouvettes, sans autre modification. Comparez les coefficients de Poisson apparents et expliquez pourquoi les déplacements diminuent mais pas ce rapport.',
takeaway:'En élasticité linéaire à petites déformations, le coefficient apparent est pratiquement indépendant de l’allongement imposé. Il décrit la réponse globale de cette éprouvette finie.',
technical:'Le dossier contient deux maillages, les bords nommés et un générateur géométrique. Ligament incliné 10 mm, vertical 15 mm, largeur 1,2 mm, angle −30°, 3×3 périodes rectangulaires ; fragments de bord isolés supprimés. Utilisez des éléments quadratiques. Le coefficient apparent est l’opposé du rapport déformation transversale/déformation axiale, et non une propriété effective d’un milieu périodique infini.',
imageAlt:'À déformation horizontale identique, la plaque se contracte verticalement et le nid d’abeilles s’élargit ; déplacements amplifiés 50 fois.'
}]
};
for(const [lang,lessons] of Object.entries(items)){
 lessons[0].prompt += {zh:' 特征值求解容差设为 1e-7，并检查残差。',en:' Set the eigenvalue solver tolerance to 1e-7 and check the residual.',fr:' Fixez la tolérance du solveur aux valeurs propres à 1e-7 et vérifiez le résidu.'}[lang];
 const file=`public/learn/lessons${lang==='zh'?'':'.'+lang}.json`;
 const data=JSON.parse(fs.readFileSync(file));
 data.lessons=[...data.lessons.slice(0,4),...lessons];
 data.intro={zh:'六个小案例，复制提示词就能开始。先算出一个结果，再试着改变条件。',en:'Six short exercises with prompts to copy. Obtain a result, then change one condition.',fr:'Six exercices courts avec des consignes à copier. Obtenez un résultat, puis modifiez une condition.'}[lang];
 fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
 if(lang!=='zh'){
  const path=`docs/handout/content.${lang}.json`;
  const content=JSON.parse(fs.readFileSync(path));
  content.steps=content.steps.map(text=>text.replace('aux pages 6 et 7','aux pages 8 à 10'));
  content.lessons[3].deliver=content.lessons[3].deliver.replace('six-time','four-time').replace('six instants','quatre instants');
  fs.writeFileSync(path,JSON.stringify(content,null,2)+'\n');
 }
}
