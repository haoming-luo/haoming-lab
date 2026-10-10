"""English/French seven-page classroom editions using the web prompt sources."""
import json, os
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from handout_schematics import ProblemDiagram

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'docs/handout'
LANG=os.environ.get('HANDOUT_LANGUAGE','en')
assert LANG in ('en','fr')
D=json.loads((SOURCE/f'content.{LANG}.json').read_text())
PROMPTS=json.loads((ROOT/f'public/learn/lessons.{LANG}.json').read_text())
A=json.loads((SOURCE/'answers.json').read_text())
def L(en,fr):return en if LANG=='en' else fr
def number(value,digits=3):
    s=f'{value:.{digits}f}'
    return s if LANG=='en' else s.replace('.',',')
pdfmetrics.registerFont(TTFont('Song','/System/Library/Fonts/Supplemental/Times New Roman.ttf'))
pdfmetrics.registerFont(TTFont('Hei','/System/Library/Fonts/Supplemental/Arial.ttf'))
styles={}
for name,size,leading,font in [('body',10.5,14,'Song'),('small',9,11.5,'Song'),('title',23,29,'Hei'),('h1',16,21,'Hei'),('h2',12,16,'Hei'),('label',10,13,'Hei'),('prompt',10.5,13.5,'Song'),('formula',11,16,'Song'),('reference',8,10.5,'Song'),('exercise',10.5,13.5,'Song'),('exercise_heading',12,16,'Hei')]:
    styles[name]=ParagraphStyle(name,fontName=font,fontSize=size,leading=leading,spaceAfter=6,textColor=colors.black)
for name in ['h2','exercise_heading','label']:styles[name].spaceBefore=5
def P(text,style='body',raw=False):return Paragraph(text if raw else escape(text),styles[style])
def table(rows,widths,header=False):
    obj=Table([[P(str(x),'small') for x in row] for row in rows],colWidths=widths,hAlign='LEFT')
    cmds=[('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),('GRID',(0,0),(-1,-1),.35,colors.HexColor('#d9d9d9'))]
    cmds.append(('BACKGROUND',(0,0),(-1,0) if header else (0,-1),colors.HexColor('#eeeeee')))
    obj.setStyle(TableStyle(cmds));return obj
def fig(name):
    width=360 if name in ('beam','cylinder') else 270
    obj=Image(str(SOURCE/'figures'/f'{name}-{LANG}.png'))
    obj.drawHeight=obj.imageHeight/obj.imageWidth*width;obj.drawWidth=width
    return obj
def page(c,doc):
    c.setFont('Hei',8);c.drawString(48,813,D['subtitle'])
    c.setFont('Song',8);c.drawString(48,26,'Haoming Luo');c.drawRightString(547,26,f'{doc.page} / 7')

story=[P(D['title'],'title'),P(D['subtitle'],'h2'),P(D['name'],'small'),P(D['aimTitle'],'h2'),P(D['aim']),P(D['setup'],'h2'),P(D['setupIntro'],'small'),P(PROMPTS['ready'],'prompt'),P(D['setupNext'],'small'),P(PROMPTS['common'],'prompt'),P(D['stepsTitle'],'h2')]
for i,text in enumerate(D['steps'],1):story.append(P(f'{i}. {text}','exercise'))
story.extend([P(D['overview'],'h2'),table([D['overviewHead']]+[[str(i+2),x['title'],D['checks'][i]] for i,x in enumerate(D['lessons'])],[35,228,236],True),Spacer(1,6),P(D['retain'],'small'),P(D['install'],'small')])
for i,(x,shared) in enumerate(zip(D['lessons'],PROMPTS['lessons']),1):
    story.extend([PageBreak(),P(f'{D["exercise"]} {i}  {x["title"]}','h1'),P(x['goal'],'small'),ProblemDiagram(i,LANG),P(D['conditions'],'exercise_heading'),table(x['conditions'],[105,394]),Spacer(1,5),P(D['prompt'],'exercise_heading'),P(shared['prompt'],'prompt'),P(D['tasksTitle'],'exercise_heading')])
    for j,text in enumerate(x['tasks'],1):story.append(P(f'{j}. {text}','exercise'))
    story.extend([P(D['follow'],'label'),P(shared['follow'],'prompt'),P(x['deliver'],'small'),P(D['recordTitle'],'exercise_heading')])
    for text in x['record']:story.append(P(text,'small'))

story.extend([PageBreak(),P(L('Reference answers 1','Corrigé 1'),'h1'),P(L('Complete your observations before checking. Use these values to verify magnitudes and trends; different meshes need not agree digit for digit.','Complétez vos observations avant de consulter le corrigé. Vérifiez les ordres de grandeur et les tendances, sans exiger une égalité chiffre par chiffre entre maillages.'),'small'),P('1  '+D['lessons'][0]['title'],'h2'),P(L('For a rectangular section and an Euler–Bernoulli cantilever:','Pour une section rectangulaire et une poutre d’Euler–Bernoulli :')),P('I = bh<super>3</super>/12 = 6.667 × 10<super>−9</super> m<super>4</super>;  δ = FL<super>3</super>/(3EI).','formula',True),table([L(['Total force','Beam theory / mm','FE or linear scaling / mm'],['Force totale','Théorie / mm','EF ou proportionnalité / mm']),['200 N',number(A['beam_theory_mm']),number(A['beam_fe_mm'])+L(' (FE)',' (EF)')],['400 N',number(2*A['beam_theory_mm']),number(2*A['beam_fe_mm'])+L(' (linear scaling)',' (proportionnalité)')]],[90,155,254],True),Spacer(1,5),fig('beam'),P(L('Figure 1. Beam displacement; dashed outline: original shape; deformation ×15.','Figure 1. Déplacement de la poutre ; pointillés : forme initiale ; déformée ×15.'),'small'),P(L('Downward displacement is negative when y points upwards; the table reports its magnitude. The FE value is about 0.59% above beam theory. The 2D elasticity solution includes shear and end-restraint effects, whereas beam theory is approximate. Doubling the load gives a displacement ratio of 2 in linear elasticity.','Le déplacement vers le bas est négatif si y est orienté vers le haut ; le tableau donne sa valeur absolue. Le résultat EF dépasse la théorie des poutres d’environ 0,59 %. L’élasticité 2D inclut le cisaillement et les effets d’encastrement, tandis que la théorie des poutres est approchée. En élasticité linéaire, doubler la charge donne un rapport de déplacement égal à 2.'),'small'),P('2  '+D['lessons'][1]['title'],'h2'),P(L('For zero axial strain and zero external pressure, Lamé’s solution gives:','Pour une déformation axiale nulle et une pression externe nulle, la solution de Lamé donne :')),P('A = pa<super>2</super>/(b<super>2</super> − a<super>2</super>);  B = pa<super>2</super>b<super>2</super>/(b<super>2</super> − a<super>2</super>).<br/>u<sub>r</sub>(r) = [(1 + ν)/E] [(1 − 2ν)Ar + B/r].','formula',True),table([L(['Outer radius','Inner displacement / μm','Source'],['Rayon extérieur','Déplacement intérieur / μm','Source']),['50 mm',number(A['cylinder_fe_um']),L('Analytical and baseline FE','Analytique et EF de référence')],['60 mm',number(A['cylinder_60_analytic_um']),L('Analytical','Analytique')]],[95,170,234],True),Spacer(1,5),fig('cylinder'),P(L('Figure 2. Radial displacement through the wall and Lamé’s solution.','Figure 2. Déplacement radial dans l’épaisseur et solution de Lamé.'),'small'),P(L('Increasing the outer radius from 50 to 60 mm reduces inner-wall displacement by about 11.76%. The axial restraint is unchanged. Do not apply this displacement formula directly to a freely extending or end-capped cylinder.','Passer de 50 à 60 mm de rayon extérieur réduit le déplacement intérieur d’environ 11,76 %. La contrainte cinématique axiale reste inchangée. Cette formule ne s’applique pas directement à un cylindre libre de s’allonger ou muni de fonds.'),'small')])

story.extend([PageBreak(),P(L('Reference answers 2','Corrigé 2'),'h1'),P('3  '+D['lessons'][2]['title'],'h2'),P(L('With uniform material, no internal source and insulated top and bottom boundaries, temperature depends only on x. Set L = 0.1 m, with x increasing to the right:','Pour un matériau uniforme, sans source interne et avec les bords supérieur et inférieur adiabatiques, la température ne dépend que de x. Posons L = 0,1 m, avec x orienté vers la droite :')),P('T(x) = 100 − 80x/L (°C);  q<sub>x</sub> = −k dT/dx = 80k/L.','formula',True),table([L(['Conductivity / W/(m·K)','Centre / °C','Heat flux / W/m²'],['Conductivité / W/(m·K)','Centre / °C','Flux thermique / W/m²']),['45','60','36 000'],['90','60','72 000']],[195,130,174],True),Spacer(1,5),fig('steady'),P(L('Figure 3. Temperature along the horizontal centreline.','Figure 3. Température sur la ligne médiane horizontale.'),'small'),P(L('At fixed end temperatures, changing uniform conductivity does not change this temperature profile, but it changes heat flux. Positive flux points to the right.','À températures imposées, changer la conductivité uniforme ne modifie pas ce profil, mais modifie le flux thermique. Le flux positif est dirigé vers la droite.'),'small'),P('4  '+D['lessons'][3]['title'],'h2'),P(L('Thermal diffusivity α = k/(ρc) = 1.154 × 10⁻⁵ m²/s. The analytical centre temperature for t > 0 is:','Diffusivité thermique α = k/(ρc) = 1,154 × 10⁻⁵ m²/s. La température centrale analytique pour t > 0 est :').replace('⁻⁵','<super>−5</super>'),'body',True),P('T(L/2,t) = 60 − (160/π) Σ<sub>n=1</sub><super>∞</super> [sin(nπ/2)/n] exp(−n<super>2</super>π<super>2</super>αt/L<super>2</super>).','formula',True),table([L(['Time / s','Δt = 2 s / °C','Δt = 1 s / °C','Analytical / °C'],['Temps / s','Δt = 2 s / °C','Δt = 1 s / °C','Analytique / °C'])]+[[str(r['time_s']),number(r['fe_dt2_c']),number(r['fe_dt1_c']),number(r['analytic_c'])] for r in A['time_rows']],[75,141,141,142],True),Spacer(1,5),fig('transient'),P(L('Figure 4. Centre temperature history; dashed line: steady state at 60 °C.','Figure 4. Température centrale ; pointillés : régime stationnaire à 60 °C.'),'small'),P(L(f"The maximum difference at shared sample times is {number(A['time_step_max_difference_c'])} °C; at 600 s it is {number(A['time_step_final_difference_c'],4)} °C. Agreement at the endpoint alone is insufficient: check the whole history against the required accuracy.",f"L’écart maximal aux instants communs est de {number(A['time_step_max_difference_c'])} °C ; à 600 s, il vaut {number(A['time_step_final_difference_c'],4)} °C. L’accord final ne suffit pas : vérifiez toute l’évolution selon la précision recherchée."),'small'),P(L('Reference runs: AgentFEM 0.4.0.dev0 / DOLFINx 0.11.0. Beam: 80 × 8 quadratic elements; cylinder: 40 × 4 quadratic elements; heat: 80 × 16 linear elements. Backward Euler for transient heat; values converted to the displayed units.','Calculs : AgentFEM 0.4.0.dev0 / DOLFINx 0.11.0. Poutre : 80 × 8 éléments quadratiques ; cylindre : 40 × 4 quadratiques ; thermique : 80 × 16 linéaires. Euler implicite en transitoire ; valeurs converties dans les unités indiquées.'),'small'),P(L('References','Références'),'h2')])
for label,url in [
 (L('[1] Interactive web edition with copyable prompts and results.','[1] Version web interactive avec consignes à copier et résultats.'),f'https://lab.haoming-luo.com/learn/{LANG}.html'),
 (L('[2] AgentFEM installation guide.','[2] Guide d’installation d’AgentFEM.'),'https://github.com/haoming-luo/agentfem/blob/main/INSTALL.md'),
 (L('[3] Connecting an AI assistant to AgentFEM.','[3] Connexion d’un assistant IA à AgentFEM.'),'https://haoming-luo.github.io/agentfem/agents/mcp/')]:
    story.append(P(f'{escape(label)} <link href="{url}" color="#336b85">{url}</link>','reference',True))
story.extend([Spacer(1,8),P(D['ack'],'small')])
out=ROOT/f'public/learn/AgentFEM-first-simulations-{LANG}.pdf'
doc=SimpleDocTemplate(str(out),pagesize=(595.28,841.89),leftMargin=48,rightMargin=48,topMargin=48,bottomMargin=46,title=D['title'],author='Haoming Luo',subject=D['subtitle'])
doc.build(story,onFirstPage=page,onLaterPages=page)
print(out)
