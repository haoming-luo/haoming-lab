// Canonical additions; run before build-learning.mjs. Existing lessons are preserved.
import fs from 'node:fs';
const items={
zh:[{
id:'column',number:'05',label:'从变形到失稳',title:'细杆能承受多大的压力？',
problem:'慢慢加大压力，杆端的侧向位移会一直按比例增加吗？画出载荷与侧向位移的关系，看看接近欧拉临界载荷时发生了什么。',
prompt:'请用 AgentFEM 计算压杆逐步受压的响应：长 L=200 mm，截面 10×10 mm，E=210 GPa、泊松比 0.3，左端固定，右端受均布水平压力、可自由转动，其余边界自由，忽略重力。采用二维平面应力和几何非线性，材料用相同 E、ν 的平面应力 Neo-Hookean 弹性模型。加入无应力初始弯曲 y₀(x)=0.1[1−cos(πx/2L)] mm。总压力从 0 分步加到 12 kN，临界附近细分。画“总压力—右端平均侧向位移”曲线（位移相对初始形状），标出欧拉值 π²EI/(4L²)，并给出几个载荷下的变形图。',
expect:'一条载荷—侧向位移曲线，以及几个载荷下的杆形。',result:'欧拉临界载荷：10.795 kN',
read:'接近这个载荷时，侧向位移增长明显加快。有初始弯曲的杆会平滑地弯下去，不会在某一点突然从完全笔直跳到弯曲。',
follow:'把初始弯曲幅值从 0.1 mm 改成 0.2 mm，其他条件不变。将两条载荷—侧向位移曲线画在同一张图上，比较相同载荷下的弯曲程度。',
takeaway:'初始弯曲会影响受压时的侧向位移；欧拉公式给出的是理想直杆的临界值。',
technical:'需要支持几何非线性和平面应力 Neo-Hookean 材料的新版 AgentFEM。使用二次单元和逐步加载；初始弯曲是无应力几何，不是预先施加的位移。右端不能规定整面相同的轴向位移，否则会限制转动、改变临界载荷。该例是理想弹性稳定性教学，不包含钢材屈服。',
imageAlt:'实际计算的压杆载荷—侧向位移曲线，并标出理想直杆的欧拉临界载荷。'
},{
id:'honeycomb',number:'06',label:'让几何改变性能',title:'为什么它越拉越宽？',
problem:'实心板被拉长时通常会变窄。换成内凹蜂窝，使用相同材料，它却可以同时变宽。先下载网格包，解压后把文件夹交给 AI 助手。',
prompt:'请用 AgentFEM 导入附件 honeycomb.msh，不重新绘制几何。坐标单位为米，宽 51.9615 mm、高 60 mm；边界标签 11/12/13/14 分别为左/右/下/上。采用二维平面应力、小变形线弹性，E=1 GPa、泊松比 0.3，忽略重力。左侧水平位移为零，右侧水平拉伸宽度的 0.1%，竖向自由，仅固定左下角竖向位移。用四侧边界平均位移计算轴向、横向应变及表观泊松比。与相同尺寸、材料和约束的实心板并排画变形图，叠加原形轮廓，位移统一放大 100 倍并注明。',
expect:'蜂窝与实心板的变形对比图、轴向和横向应变、各自的表观泊松比。',result:'蜂窝约 −1.30；实心板 0.30',
read:'两者都被水平拉长，蜂窝竖向展开，实心板竖向收缩。负泊松比来自结构形状，材料本身的泊松比仍是 0.3。',
follow:'用这次结果生成蜂窝与实心板同步拉伸、回到原形的循环 GIF。固定视角和坐标范围，位移统一放大 100 倍并注明，保留原形轮廓。',
takeaway:'动画把“一个变宽、一个变窄”放在一起看清楚。100 倍是显示放大，不是把实际拉伸量加大。',
technical:'附件含基准网格、加密网格、边界说明和几何生成脚本。斜肋长 10 mm、竖肋长 15 mm、肋宽 1.2 mm、夹角 −30°，3×3 个矩形周期，已去除边缘孤立片段。使用二次位移单元；表观泊松比为负的横向应变与轴向应变之比，不等同于无限周期材料的有效泊松比。',
imageAlt:'相同水平拉伸下，实心板竖向收缩，内凹蜂窝竖向展开；位移放大100倍，虚线为原形。'
}],
en:[{
id:'column',number:'05',label:'From deformation to instability',title:'How much compression can a slender column carry?',
problem:'As compression increases, does sideways displacement remain proportional to the load? Plot the response and see what happens near Euler’s critical load.',
prompt:'Use AgentFEM to load a column gradually: length L=200 mm, section 10×10 mm, E=210 GPa, Poisson’s ratio 0.3. Clamp the left end; apply uniform horizontal compression to the right face and leave its rotation free. Other boundaries are free; neglect gravity. Use geometrically nonlinear 2D plane stress with a plane-stress Neo-Hookean elastic material having the same E and ν. Add a stress-free initial bow y₀(x)=0.1[1−cos(πx/2L)] mm. Increase total force from 0 to 12 kN in increments, using smaller steps near buckling. Plot total force versus mean right-end lateral displacement relative to the initial shape. Mark Euler’s value π²EI/(4L²) and show deformed shapes at several loads.',
expect:'A load–lateral displacement curve and deformed shapes at several loads.',result:'Euler critical load: 10.795 kN',
read:'Lateral displacement grows much faster near this load. An initially curved column bends smoothly; it does not jump from perfectly straight to bent at one point.',
follow:'Increase the initial bow from 0.1 to 0.2 mm, keeping other settings unchanged. Overlay the two load–lateral displacement curves and compare their deflections at the same load.',
takeaway:'Initial curvature affects lateral deflection under compression. Euler’s formula gives the critical load of an ideal straight column.',
technical:'Requires an AgentFEM version supporting geometric nonlinearity and plane-stress Neo-Hookean elasticity. Use quadratic elements and incremental loading. The bow is stress-free geometry, not an imposed displacement. Do not prescribe uniform axial displacement over the right face: that prevents rotation and changes the critical load. This is an ideal elastic stability exercise, without steel yielding.',
imageAlt:'Computed column load–lateral displacement curve with the ideal Euler critical load marked.'
},{
id:'honeycomb',number:'06',label:'Geometry changes the response',title:'Why does it get wider when stretched?',
problem:'A solid plate usually narrows when stretched. A re-entrant honeycomb made of the same material can widen. Download and unzip the mesh pack, then give the folder to your AI assistant.',
prompt:'Use AgentFEM to import the attached honeycomb.msh without redrawing the geometry. Coordinates are in metres; width 51.9615 mm, height 60 mm. Boundary tags 11/12/13/14 mean left/right/bottom/top. Use small-strain linear elasticity in 2D plane stress, E=1 GPa and Poisson’s ratio 0.3; neglect gravity. Fix horizontal displacement on the left and impose a horizontal extension of 0.1% of the width on the right. Leave vertical motion free except for the bottom-left vertical displacement. Use mean displacements on all four boundaries to calculate axial and transverse strains and apparent Poisson’s ratio. Compare with a solid plate of the same size, material and constraints. Show one deformation comparison plot with its magnification.',
expect:'Deformed honeycomb and solid plate, their axial and transverse strains, and apparent Poisson’s ratios.',result:'Honeycomb about −1.30; solid plate 0.30',
read:'Both extend horizontally; the honeycomb expands vertically while the plate contracts. The negative ratio comes from geometry: the constituent material still has Poisson’s ratio 0.3.',
follow:'Use these results to make a looping GIF showing the honeycomb and solid plate stretching together and returning to their original shapes. Keep the view and axis limits fixed, show the original outlines, and label displacement magnification ×100.',
takeaway:'The animation makes the opposite width changes easy to see. ×100 magnifies the display, not the applied extension.',
technical:'The pack contains baseline and refined meshes, boundary definitions and a geometry generator. Inclined ligament 10 mm, vertical ligament 15 mm, wall width 1.2 mm, angle −30°, 3×3 rectangular periods; disconnected boundary fragments are removed. Use quadratic displacement elements. Apparent Poisson’s ratio is minus transverse strain divided by axial strain, not the effective ratio of an infinite periodic material.',
imageAlt:'At equal horizontal strain, the solid plate contracts vertically and the re-entrant honeycomb expands; displacement magnified 100 times, with original outlines.'
}],
fr:[{
id:'column',number:'05',label:'De la déformation à l’instabilité',title:'Quelle compression une tige élancée peut-elle supporter ?',
problem:'Quand la compression augmente, le déplacement latéral reste-t-il proportionnel à la charge ? Tracez la réponse et observez ce qui se passe près de la charge critique d’Euler.',
prompt:'Avec AgentFEM, comprimez progressivement une tige de longueur L=200 mm, de section 10×10 mm, E=210 GPa et coefficient de Poisson 0,3. Encastrez la gauche ; appliquez une compression horizontale uniforme à droite, en laissant la rotation libre. Les autres bords sont libres ; négligez la pesanteur. Utilisez les contraintes planes 2D avec non-linéarité géométrique et un matériau élastique Neo-Hookean en contraintes planes de mêmes E et ν. Ajoutez une courbure initiale sans contrainte y₀(x)=0,1[1−cos(πx/2L)] mm. Augmentez la force totale de 0 à 12 kN par incréments, plus petits près du flambement. Tracez la force en fonction du déplacement latéral moyen à droite, mesuré depuis la forme initiale. Indiquez la valeur d’Euler π²EI/(4L²) et les déformées sous plusieurs charges.',
expect:'Une courbe charge–déplacement latéral et plusieurs déformées.',result:'Charge critique d’Euler : 10,795 kN',
read:'Le déplacement latéral augmente beaucoup plus vite près de cette charge. Une tige initialement courbe fléchit progressivement, sans saut depuis une forme parfaitement droite.',
follow:'Portez la courbure initiale de 0,1 à 0,2 mm, sans autre modification. Superposez les deux courbes charge–déplacement latéral et comparez les flèches à charge égale.',
takeaway:'La courbure initiale influe sur la flèche sous compression. La formule d’Euler concerne la tige droite idéale.',
technical:'Nécessite une version d’AgentFEM avec non-linéarité géométrique et élasticité Neo-Hookean en contraintes planes. Utilisez des éléments quadratiques et un chargement incrémental. La courbure initiale est sans contrainte. Ne prescrivez pas un déplacement axial uniforme sur toute la face droite : cela bloque la rotation et change la charge critique. Exercice élastique idéal, sans plasticité de l’acier.',
imageAlt:'Courbe charge–déplacement latéral calculée, avec la charge critique d’Euler de la tige idéale.'
},{
id:'honeycomb',number:'06',label:'La géométrie change la réponse',title:'Pourquoi s’élargit-il quand on l’étire ?',
problem:'Une plaque pleine se rétrécit généralement en traction. Un nid d’abeilles rentrant du même matériau peut s’élargir. Téléchargez et décompressez les fichiers, puis transmettez le dossier à votre assistant IA.',
prompt:'Avec AgentFEM, importez le fichier joint honeycomb.msh sans redessiner la géométrie. Les coordonnées sont en mètres ; largeur 51,9615 mm, hauteur 60 mm. Les étiquettes 11/12/13/14 désignent gauche/droite/bas/haut. Utilisez l’élasticité linéaire en petites déformations et contraintes planes 2D : E=1 GPa, coefficient de Poisson 0,3 ; négligez la pesanteur. Bloquez le déplacement horizontal à gauche et imposez à droite un allongement horizontal de 0,1 % de la largeur. Le mouvement vertical est libre, sauf au coin inférieur gauche. Calculez les déformations axiale et transversale et le coefficient de Poisson apparent à partir des déplacements moyens des quatre bords. Comparez à une plaque pleine de mêmes dimensions, matériau et appuis. Donnez une figure comparative avec le facteur d’amplification.',
expect:'Les déformées du nid d’abeilles et de la plaque, leurs déformations axiale et transversale et leurs coefficients de Poisson apparents.',result:'Nid d’abeilles environ −1,30 ; plaque 0,30',
read:'Les deux s’allongent horizontalement. Le nid d’abeilles s’étend verticalement, la plaque se contracte. Le coefficient négatif vient de la géométrie ; celui du matériau reste égal à 0,3.',
follow:'À partir de ces résultats, créez un GIF en boucle montrant le nid d’abeilles et la plaque étirés ensemble, puis revenus à leur forme initiale. Gardez le cadrage et les limites des axes fixes, conservez les contours initiaux et indiquez l’amplification des déplacements ×100.',
takeaway:'L’animation montre clairement les variations de largeur opposées. Le facteur ×100 amplifie l’affichage, pas l’allongement imposé.',
technical:'Le dossier contient deux maillages, les bords nommés et un générateur géométrique. Ligament incliné 10 mm, vertical 15 mm, largeur 1,2 mm, angle −30°, 3×3 périodes rectangulaires ; fragments de bord isolés supprimés. Utilisez des éléments quadratiques. Le coefficient apparent est l’opposé du rapport déformation transversale/déformation axiale, et non une propriété effective d’un milieu périodique infini.',
imageAlt:'À déformation horizontale identique, la plaque se contracte verticalement et le nid d’abeilles s’élargit ; déplacements amplifiés 100 fois et contours initiaux visibles.'
}]
};
for(const [lang,lessons] of Object.entries(items)){
 lessons[0].prompt=lessons[0].prompt.replace('12 kN',lang==='fr'?'10,7 kN':'10.7 kN');
 lessons[0].prompt += {zh:' 数值设置：采用 N、mm、MPa 单位，牛顿绝对残差容差 1e-6，自动加载最多 1500 步。',en:' Numerical settings: N, mm, MPa; Newton absolute residual tolerance 1e-6; allow up to 1500 adaptive increments.',fr:' Réglages : N, mm, MPa ; tolérance absolue du résidu de Newton 1e-6 ; jusqu’à 1500 incréments adaptatifs.'}[lang];
 lessons[0].technical += {zh:' 参考计算采用 N、mm、MPa 单位，60×4 二次网格、4 阶积分，牛顿绝对残差容差 1e-6；临界前最大载荷为 10.7 kN。',en:' Reference run: N, mm, MPa; 60×4 quadratic mesh, quadrature degree 4, Newton absolute residual tolerance 1e-6; maximum precritical load 10.7 kN.',fr:' Calcul de référence : N, mm, MPa ; maillage quadratique 60×4, quadrature de degré 4, tolérance absolue du résidu de Newton 1e-6 ; charge précritique maximale de 10,7 kN.'}[lang];
 if(lang==='en')lessons[1].prompt=lessons[1].prompt.replace('Show one deformation comparison plot with its magnification.','Show both deformed shapes side by side with their original outlines; magnify displacement 100 times and label the factor.');
 if(lang==='fr')lessons[1].prompt=lessons[1].prompt.replace('Donnez une figure comparative avec le facteur d’amplification.','Tracez les deux déformées côte à côte avec leurs contours initiaux ; amplifiez les déplacements 100 fois et indiquez ce facteur.');
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
