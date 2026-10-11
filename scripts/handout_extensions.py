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
        title=L('压杆的线性屈曲','Linear column buckling','Flambement linéaire d’une tige') if i==5 else L('内凹蜂窝的拉伸响应','Tension of a re-entrant honeycomb','Traction d’un nid d’abeilles rentrant')
        out += [PageBreak(),P(f'{L("实验","Exercise","Exercice")} {i}  {title}','h1'),P(x['problem'],'small')]
        im=Image(str(ROOT/f'public/learn/assets/{x["id"]}-setup{suffix}.png'));im.drawHeight=im.imageHeight/im.imageWidth*460;im.drawWidth=460
        out.append(im)
        if i==6:
            url='https://lab.haoming-luo.com/learn/files/honeycomb.zip'
            out += [P(L('先下载并解压附件，将 honeycomb.msh 所在文件夹交给 AI。坐标单位为米。','Download and unzip the pack; give the folder containing honeycomb.msh to the AI. Coordinates are in metres.','Téléchargez et décompressez le dossier ; transmettez-le à l’IA. Les coordonnées sont en mètres.'),'small'),P(f'<link href="{url}" color="#336b85">{url}</link>','reference',True)]
        else:
            out.append(P(L('运行条件：包含 2026-10-10 屈曲更新的 AgentFEM 与 SLEPc。v0.4.1 尚不包含此功能。','Requires AgentFEM with the 2026-10-10 buckling update and SLEPc; v0.4.1 predates it.','Nécessite la mise à jour AgentFEM du 10 octobre 2026 et SLEPc ; v0.4.1 est antérieure.'),'small'))
        out += [P(L('建模提示词','Modeling prompt','Consigne de modélisation'),'h2'),P(x['prompt'],'prompt'),P(L('对比计算提示词','Follow-up calculation','Calcul comparatif'),'h2'),P(x['follow'],'prompt'),P(L('实验记录','Observations','Observations'),'h2')]
        records= [L('200 mm：________ N    400 mm：________ N    比值：________','200 mm: ________ N    400 mm: ________ N    Ratio: ________','200 mm : ________ N    400 mm : ________ N    Rapport : ________'),L('欧拉参考值：________ N    相对差异：________ %','Euler reference: ________ N    Relative difference: ________ %','Référence d’Euler : ________ N    Écart relatif : ________ %')] if i==5 else [L('蜂窝：轴向应变 ________  横向应变 ________  表观泊松比 ________','Honeycomb: axial strain ________ transverse strain ________ ratio ________','Nid d’abeilles : déformation axiale ________ transversale ________ coefficient ________'),L('实心板泊松比：________    拉伸减半后的蜂窝泊松比：________','Solid plate ratio: ________    Honeycomb ratio at half extension: ________','Coefficient de la plaque : ________    Nid à demi-allongement : ________')]
        out.extend(P(s,'small') for s in records)
        out.append(P(L('提交：一张对比图、关键数值及两三句话解释。','Submit one comparison plot, key values and a two- or three-sentence explanation.','Rendez une figure comparative, les valeurs principales et deux ou trois phrases d’explication.'),'small'))
    return out

def extra_answers(P,table,lang='zh'):
    idx={'zh':0,'en':1,'fr':2}[lang]
    def L(*s):return s[idx]
    suffix='' if lang=='zh' else '-'+lang
    a=json.loads((ROOT/'public/learn/assets/extension-results.json').read_text())
    out=[PageBreak(),P(L('参考解答 三','Reference answers 3','Corrigé 3'),'h1'),P(L('5  压杆失稳','5  Column buckling','5  Flambement'),'h2'),P('I = bh<super>3</super>/12;  P<sub>cr</sub> = π<super>2</super>EI/(4L<super>2</super>).','formula',True)]
    out.append(table([L(['长度 / mm','有限元 / N','欧拉公式 / N'],['Length / mm','FE / N','Euler / N'],['Longueur / mm','EF / N','Euler / N'])]+[[str(int(a[key]['length_mm'])),f"{a[key]['critical_load_N']:.2f}",f"{a[key]['euler_load_N']:.2f}"] for key in ['column','column_double_length']],[100,190,209],True))
    im=Image(str(ROOT/f'public/learn/assets/column{suffix}.png'));im.drawHeight=im.imageHeight/im.imageWidth*340;im.drawWidth=340;out.append(im)
    out.append(P(L('模态幅值仅用于显示。参考力乘以特征值才是临界载荷；长杆与短杆的临界载荷之比约为 0.25。','Mode amplitude is for display only. Critical load equals reference force times eigenvalue; the long-to-short column load ratio is about 0.25.','L’amplitude du mode est illustrative. La charge critique est la force de référence multipliée par la valeur propre ; le rapport long/court est voisin de 0,25.'),'small'))
    out += [P(L('6  负泊松比','6  Negative Poisson’s ratio','6  Coefficient de Poisson négatif'),'h2'),P('ν<sub>app</sub> = −ε<sub>y</sub>/ε<sub>x</sub>.','formula',True)]
    out.append(table([L(['试样','轴向应变','横向应变','表观泊松比'],['Specimen','Axial strain','Transverse strain','Apparent ratio'],['Éprouvette','Déformation axiale','Transversale','Coefficient apparent'])]+[[name,f"{a[key]['axial_gauge_strain']:.6f}",f"{a[key]['transverse_gauge_strain']:.6f}",f"{a[key]['apparent_poisson_ratio']:.4f}"] for name,key in [(L('蜂窝','Honeycomb','Nid d’abeilles'),'honeycomb'),(L('实心板','Solid plate','Plaque'),'solid')]],[110,120,135,134],True))
    im=Image(str(ROOT/f'public/learn/assets/honeycomb{suffix}.png'));im.drawHeight=im.imageHeight/im.imageWidth*310;im.drawWidth=310;out.append(im)
    out.append(P(L('拉伸量减半后，表观泊松比不变。蜂窝网格尺寸从 0.8 mm 减至 0.4 mm，结果从 −1.3026 变为 −1.3062，相差约 0.28%。负值来自几何，不是材料参数；有限试样结果不等同于周期均匀化性质。','Halving the extension leaves the apparent ratio unchanged. Refining the honeycomb mesh from 0.8 to 0.4 mm changes it from −1.3026 to −1.3062 (about 0.28%). The negative value comes from geometry, not the material parameter. A finite-specimen response is not a periodic effective property.','Diviser l’allongement par deux ne change pas le coefficient apparent. Raffiner le maillage de 0,8 à 0,4 mm le fait passer de −1,3026 à −1,3062 (environ 0,28 %). Le signe vient de la géométrie. La réponse d’une éprouvette finie n’est pas une propriété périodique effective.'),'small'))
    return out
