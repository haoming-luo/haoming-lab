"""Seven-page classroom handout: exercises first, reference solutions last."""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from handout_schematics import ProblemDiagram

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'docs/handout'
D=json.loads((SOURCE/'content.json').read_text())
PROMPTS=json.loads((ROOT/'public/learn/lessons.json').read_text())
PROMPT_BY_ID={x['id']:x for x in PROMPTS['lessons']}
A=json.loads((SOURCE/'answers.json').read_text())
pdfmetrics.registerFont(TTFont('Song','/System/Library/Fonts/Supplemental/Songti.ttc',subfontIndex=6))
pdfmetrics.registerFont(TTFont('Hei','/System/Library/Fonts/STHeiti Medium.ttc',subfontIndex=1))
styles={}
for name,size,lead,font in [('body',10.5,17,'Song'),('small',8.6,13,'Song'),('title',24,34,'Hei'),('h1',18,27,'Hei'),('h2',12,19,'Hei'),('label',9,15,'Hei'),('prompt',10.5,17,'Song'),('formula',11,19,'Song')]:
    styles[name]=ParagraphStyle(name,fontName=font,fontSize=size,leading=lead,wordWrap='CJK',textColor=colors.HexColor('#171717'),spaceAfter=8)
styles['prompt'].backColor=colors.HexColor('#f3f3f3')
styles['prompt'].borderPadding=10
styles['prompt'].spaceBefore=8
styles['prompt'].spaceAfter=18
styles['small'].textColor=colors.HexColor('#555555')
styles['small'].spaceAfter=5
styles['formula'].leftIndent=14
styles['h2'].spaceBefore=8
styles['label'].spaceAfter=5
styles['exercise']=ParagraphStyle('exercise',parent=styles['body'],leading=15,spaceAfter=5)
styles['exercise_prompt']=ParagraphStyle('exercise_prompt',parent=styles['prompt'],leading=15,spaceBefore=5,spaceAfter=13,borderPadding=8)
styles['exercise_heading']=ParagraphStyle('exercise_heading',parent=styles['h2'],leading=16,spaceBefore=5,spaceAfter=5)
styles['reference']=ParagraphStyle('reference',parent=styles['small'],fontSize=8,leading=11,spaceAfter=3)

def P(text,style='body',raw=False):
    markup=text if raw else escape(text)
    markup=markup.replace('⁻⁵','<super>−5</super>')
    return Paragraph(markup,styles[style])
def title(text,sub=None):
    content=[P(text,'h1')]
    if sub:content.append(P(sub,'small'))
    return content
def table(rows,widths,header=False,compact=False):
    t=Table([[P(str(v),'small' if header else ('exercise' if compact else 'body')) for v in row] for row in rows],colWidths=widths,hAlign='LEFT')
    cmds=[('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),2),('LINEBELOW',(0,0),(-1,-1),.35,colors.HexColor('#d6d6d6'))]
    if header:cmds.append(('BACKGROUND',(0,0),(-1,0),colors.HexColor('#ededed')))
    else:cmds.append(('BACKGROUND',(0,0),(0,-1),colors.HexColor('#f3f3f3')))
    t.setStyle(TableStyle(cmds));return t
def fig(name,width=370):
    if name in ('steady','transient'):width=230
    im=Image(str(SOURCE/'figures'/f'{name}.png'));im.drawHeight=im.imageHeight/im.imageWidth*width;im.drawWidth=width;return im
def page(c,doc):
    c.setStrokeColor(colors.HexColor('#b0b0b0'));c.setLineWidth(.4);c.line(48,798,547,798);c.line(48,41,547,41)
    c.setFont('Hei',8);c.setFillColor(colors.HexColor('#555555'));c.drawString(48,810,'AgentFEM  /  基础实验讲义')
    c.setFont('Song',8);c.drawString(48,26,'Haoming Luo');c.drawRightString(547,26,f'{doc.page} / 7')

story=[P(D['title'],'title'),P(D['subtitle'],'h2'),P('姓名：________________    日期：________________','small'),P('一、实验目的','h2'),P('通过四个基本问题，学习描述有限元任务、检查建模条件，并用理论解或数值对比判断结果是否合理。无需预先编写程序，但应能识别几何、材料、约束、载荷及输出量。'),P('二、运行准备','h2'),P('使用已接入本地 AgentFEM 的 AI 助手。先发送环境检查提示词：','small'),P(PROMPTS['ready'],'exercise_prompt'),P('确认可用后，发送以下约定；等 AI 回复，再选择一道题发送。','small'),P(PROMPTS['common'],'exercise_prompt'),P('三、实验步骤','h2')]
for text in ['阅读题目，预判结果方向和量级；发送本题提示词，检查图、数值和单位。','完成参数对比或步长检查，填写实验记录，独立解释结果。','最后核对第 6—7 页参考解答；差异较大时先检查条件，再加密网格或减小步长。']:
    story.append(P('• '+text,'exercise'))
story.extend([P('四、练习安排','h2'),table([['页码','练习','主要核对方法'],['2','悬臂梁的静力变形','梁理论；载荷比例'],['3','厚壁圆筒的内压响应','拉梅解'],['4','矩形板的稳态导热','线性温度分布；傅里叶定律'],['5','矩形板的瞬态升温','解析级数；时间步长比较']],[45,220,234],True),Spacer(1,10),P('每题至少保留建模文件、关键数值表和一张结果图。计算统一采用 SI 单位，展示时按题目要求换算为 mm、μm 或 ℃。','small'),Paragraph('配置资料：<link href="https://github.com/haoming-luo/agentfem/blob/main/INSTALL.md">AgentFEM 安装说明</link>；<link href="https://haoming-luo.github.io/agentfem/agents/mcp/">AI 助手连接说明</link>。Windows 使用 WSL2。',styles['small'])])

for i,x in enumerate(D['lessons'],1):
    shared=PROMPT_BY_ID[x['id']]
    story.extend([PageBreak(),*title(f'实验 {i}  {x["title"]}'),P(x['goal'],'small'),ProblemDiagram(i),P('问题条件','exercise_heading'),table(x['conditions'],[90,409],compact=True),Spacer(1,5),P('建模提示词','exercise_heading'),P(shared['prompt'],'exercise_prompt'),P('实验任务','exercise_heading')])
    for j,t in enumerate(x['tasks'],1):story.append(P(f'{j}. {t}','exercise'))
    story.extend([P('对比计算提示词','label'),P(shared['follow'],'exercise_prompt'),P(x['deliver'],'small'),P('实验记录','exercise_heading')])
    for line in x['record']:story.append(P(line,'small'))

story.extend([PageBreak(),*title('参考解答（一）','建议完成实验记录后再核对。表中数值用于核查量级与趋势，不要求不同网格逐位一致。'),P('1  悬臂梁','h2'),P('矩形截面惯性矩与 Euler–Bernoulli 梁的端部挠度为：'),P('I = bh<super>3</super>/12 = 6.667 × 10<super>−9</super> m<super>4</super>；　δ = FL<super>3</super>/(3EI)。','formula',True),table([['总力','梁理论 / mm','有限元或比例推算 / mm'],['200 N','0.381','0.383（有限元）'],['400 N','0.762','0.766（按线性比例推算）']],[95,170,234],True),Spacer(1,5),fig('beam'),P('图 1  基准梁的位移；虚线为原形，变形放大 15 倍。','small'),P('端部向下位移在 y 向上为正时带负号，表中列下沉量的绝对值。基准有限元值比梁理论高约 0.59%；二维弹性解包含剪切及端部约束影响，梁理论属于近似。线弹性条件下，载荷翻倍时位移比例为 2。','small'),P('2  厚壁圆筒','h2'),P('对本题轴向平面应变、外压为零的圆筒，拉梅解为：'),P('A = pa<super>2</super>/(b<super>2</super> − a<super>2</super>)；　B = pa<super>2</super>b<super>2</super>/(b<super>2</super> − a<super>2</super>)。<br/>u<sub>r</sub>(r) = [(1 + ν)/E] [(1 − 2ν)Ar + B/r]。','formula',True),table([['外半径','内壁径向位移 / μm','数值来源'],['50 mm','2.270','解析解与基准有限元'],['60 mm','2.003','解析解']],[95,170,234],True),Spacer(1,5),fig('cylinder'),P('图 2  基准圆筒沿壁厚的径向位移与拉梅解。','small'),P('外半径从 50 mm 增至 60 mm，内壁径向位移降低约 11.76%。这里的轴向约束保持不变；自由伸长或带封头的圆筒不应直接套用上述位移公式。','small')])

story.extend([PageBreak(),*title('参考解答（二）'),P('3  稳态导热','h2'),P('材料均匀、无内热源且上下绝热，温度只随 x 变化。令 L = 0.1 m，x 从左向右，则：'),P('T(x) = 100 − 80x/L　（℃）；　q<sub>x</sub> = −k dT/dx = 80k/L。','formula',True),table([['导热系数 / W/(m·K)','中心温度 / ℃','热流密度 / W/m²'],['45','60','36 000'],['90','60','72 000']],[195,130,174],True),Spacer(1,5),fig('steady'),P('图 3  基准板沿水平中线的温度。','small'),P('两端温度固定时，改变均匀导热系数不会改变本题的稳态温度分布，但会改变热流密度；正热流指向右侧。','small'),P('4  瞬态升温','h2'),P('热扩散率 α = k/(ρc) = 1.154 × 10⁻⁵ m²/s。中心点的解析级数（t > 0）为：'),P('T(L/2,t) = 60 − (160/π) Σ<sub>n=1</sub><super>∞</super> [sin(nπ/2)/n] exp(−n<super>2</super>π<super>2</super>αt/L<super>2</super>)。','formula',True),table([['时间 / s','Δt = 2 s / ℃','Δt = 1 s / ℃','解析解 / ℃']]+[[str(r['time_s']),f"{r['fe_dt2_c']:.3f}",f"{r['fe_dt1_c']:.3f}",f"{r['analytic_c']:.3f}"] for r in A['time_rows']],[75,141,141,142],True),Spacer(1,5),fig('transient'),P('图 4  中心温度时间历程；虚线为稳态温度 60 ℃。','small'),P(f"共同采样时刻的两步长最大温差为 {A['time_step_max_difference_c']:.3f} ℃，600 s 时温差为 {A['time_step_final_difference_c']:.4f} ℃。终点温度接近不能代替全过程检查；是否足够准确，应结合所需温度精度判断。",'small'),P('参考计算：AgentFEM 0.4.0.dev0 / DOLFINx 0.11.0。梁：80 × 8 二次单元；圆筒：40 × 4 二次单元；导热：80 × 16 一次单元。瞬态采用隐式 Euler；显示值按指定单位换算。','small')])

story.extend([P('参考资料','h2')])
for label,url in [
    ('[1] 本讲义网页互动版：可复制提示词、查看结果图与操作说明。','https://lab.haoming-luo.com/learn/'),
    ('[2] AgentFEM 安装说明。','https://github.com/haoming-luo/agentfem/blob/main/INSTALL.md'),
    ('[3] AgentFEM：AI 助手连接与配置。','https://haoming-luo.github.io/agentfem/agents/mcp/'),
]:
    story.append(P(f'{escape(label)} <link href="{url}" color="#336b85">{url}</link>','reference',True))

story.extend([Spacer(1,4),P('致谢：感谢北京理工大学王猛教授最早提出将 AI 原生有限元仿真引入课堂的建议，感谢西北工业大学白任梓老师首次完成 AgentFEM 的 Windows 安装验证，并参与教学讲义编制。','small')])

out=ROOT/'public/learn/AgentFEM-first-simulations.pdf'
doc=SimpleDocTemplate(str(out),pagesize=(595.28,841.89),leftMargin=48,rightMargin=48,topMargin=56,bottomMargin=51,title=D['title']+'：'+D['subtitle'],author='Haoming Luo',subject='四项有限元实验、可复制提示词与参考解答')
doc.build(story,onFirstPage=page,onLaterPages=page)
print(out)
