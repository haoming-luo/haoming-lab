"""Lessons 5–6 share their prompts with the website; answers use computed data."""
from pathlib import Path
import json
from xml.sax.saxutils import escape
from reportlab.platypus import PageBreak,Image,Spacer
ROOT=Path(__file__).resolve().parents[1]
def extra_exercises(P,table,lang='zh'):
    idx={'zh':0,'en':1,'fr':2}[lang]
    def L(*s):return s[idx]
    suffix='' if lang=='zh' else '-'+lang
    lessons=json.loads((ROOT/f'public/learn/lessons{("."+lang) if lang!="zh" else ""}.json').read_text())['lessons'][4:]
    out=[]
    for i,x in enumerate(lessons,5):
        title=L('压杆的受压响应','Column response under compression','Réponse d’une tige en compression') if i==5 else L('内凹蜂窝的拉伸响应','Tension of a re-entrant honeycomb','Traction d’un nid d’abeilles rentrant')
        out += [PageBreak(),P(f'{L("实验","Exercise","Exercice")} {i}  {title}','h1'),P(x['problem'],'small')]
        im=Image(str(ROOT/f'docs/handout/figures/{x["id"]}-setup{suffix}.png'));im.drawHeight=im.imageHeight/im.imageWidth*460;im.drawWidth=460
        out.append(im)
        if i==6:
            url='https://lab.haoming-luo.com/learn/files/honeycomb.zip'
            out += [P(L('先下载并解压附件，将 honeycomb.msh 所在文件夹交给 AI。坐标单位为米。','Download and unzip the pack; give the folder containing honeycomb.msh to the AI. Coordinates are in metres.','Téléchargez et décompressez le dossier ; transmettez-le à l’IA. Les coordonnées sont en mètres.'),'small'),P(f'<link href="{url}" color="#336b85">{url}</link>','reference',True)]
        else:
            out.append(P(L('运行条件：支持几何非线性与平面应力 StVK 材料的新版 AgentFEM。','Requires AgentFEM with geometric nonlinearity and plane-stress StVK elasticity.','Nécessite AgentFEM avec non-linéarité géométrique et élasticité StVK en contraintes planes.'),'small'))
        out += [P(L('建模提示词','Modeling prompt','Consigne de modélisation'),'h2'),P(x['prompt'],'prompt'),P(L('再问一句','Follow-up prompt','Pour aller plus loin'),'h2'),P(x['follow'],'prompt'),P(L('实验记录','Observations','Observations'),'h2')]
        records= [L('欧拉临界载荷：________ kN    9 kN 时侧移：________ mm','Euler critical load: ________ kN    Lateral displacement at 9 kN: ________ mm','Charge critique d’Euler : ________ kN    Déplacement à 9 kN : ________ mm'),L('接近临界载荷时，曲线怎样变化？________________','How does the curve change near the critical load? ________________','Comment la courbe évolue-t-elle près de la charge critique ? ________________')] if i==5 else [L('蜂窝：轴向应变 ________  横向应变 ________  表观泊松比 ________','Honeycomb: axial strain ________ transverse strain ________ ratio ________','Nid d’abeilles : déformation axiale ________ transversale ________ coefficient ________'),L('实心板泊松比：________    GIF 文件：________________','Solid plate ratio: ________    GIF file: ________________','Coefficient de la plaque : ________    Fichier GIF : ________________')]
        out.extend(P(s,'small') for s in records)
        out.append(P(L('提交：一张对比图、关键数值及两三句话解释。','Submit one comparison plot, key values and a two- or three-sentence explanation.','Rendez une figure comparative, les valeurs principales et deux ou trois phrases d’explication.'),'small'))
    return out

def extra_answers(P,table,lang='zh'):
    idx={'zh':0,'en':1,'fr':2}[lang]
    def L(*s):return s[idx]
    suffix='' if lang=='zh' else '-'+lang
    a=json.loads((ROOT/'public/learn/assets/extension-results.json').read_text())
    out=[PageBreak(),P(L('参考解答 三','Reference answers 3','Corrigé 3'),'h1'),P(L('5  压杆失稳','5  Column buckling','5  Flambement'),'h2'),P('I = bh<super>3</super>/12;  P<sub>cr</sub> = π<super>2</super>EI/(4L<super>2</super>).','formula',True)]
    curve=a['column_load_path']['points']
    rows=[min(curve,key=lambda r:abs(r['force_N']-force)) for force in [6000,9000,10700]]
    out.append(table([L(['总压力 / kN','右端平均侧移 / mm'],['Total force / kN','Mean tip lateral displacement / mm'],['Force totale / kN','Déplacement latéral moyen / mm'])]+[[f"{r['force_N']/1000:.1f}",f"{r['tip_mm']:.3f}"] for r in rows],[190,309],True))
    im=Image(str(ROOT/f'docs/handout/figures/column{suffix}.png'));im.drawHeight=im.imageHeight/im.imageWidth*280;im.drawWidth=280;out.append(im)
    out.append(P(L('欧拉值为 10.795 kN。侧移从初始弯曲形状量起，在临界值附近迅速增长。含缺陷杆的平滑响应不是理想直杆的分岔点；本例不考虑屈服。','Euler gives 10.795 kN. Deflection is measured from the initial bowed shape and grows rapidly near this load. The imperfect response is not an ideal bifurcation; yielding is excluded.','Euler donne 10,795 kN. La flèche, mesurée depuis la forme initiale, croît rapidement près de cette charge. La réponse imparfaite n’est pas une bifurcation idéale ; la plasticité est exclue.'),'small'))
    out += [P(L('6  负泊松比','6  Negative Poisson’s ratio','6  Coefficient de Poisson négatif'),'h2'),P('ν<sub>app</sub> = −ε<sub>y</sub>/ε<sub>x</sub>.','formula',True)]
    out.append(table([L(['试样','轴向应变','横向应变','表观泊松比'],['Specimen','Axial strain','Transverse strain','Apparent ratio'],['Éprouvette','Déformation axiale','Transversale','Coefficient apparent'])]+[[name,f"{a[key]['axial_gauge_strain']:.6f}",f"{a[key]['transverse_gauge_strain']:.6f}",f"{a[key]['apparent_poisson_ratio']:.4f}"] for name,key in [(L('蜂窝','Honeycomb','Nid d’abeilles'),'honeycomb'),(L('实心板','Solid plate','Plaque'),'solid')]],[110,120,135,134],True))
    im=Image(str(ROOT/f'docs/handout/figures/honeycomb{suffix}.png'));im.drawHeight=im.imageHeight/im.imageWidth*230;im.drawWidth=230;out.append(im)
    out.append(P(L('图与 GIF 显示放大 100 倍，实际拉伸仍为 0.1%。GIF 插值展示线性结果，不是动力学仿真。加密网格给出 −1.3062，相差约 0.28%。','Figures and GIF: display ×100, actual extension 0.1%. The GIF interpolates linear results; it is not dynamics. Refinement gives −1.3062, a 0.28% change.','Figures et GIF : affichage ×100, allongement réel de 0,1 %. Le GIF interpole les résultats linéaires, sans dynamique. Le maillage affiné donne −1,3062, soit 0,28 % d’écart.'),'small'))
    return out
