"""Build the downloadable guide from the same content as the web tutorial."""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT

ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/"public/learn/lessons.json").read_text())
FONT="/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
pdfmetrics.registerFont(TTFont("CN",FONT))
INK=colors.HexColor("#173135");MUTED=colors.HexColor("#596c70");TEAL=colors.HexColor("#237a78")
styles={
 "title":ParagraphStyle("title",fontName="CN",fontSize=27,leading=39,textColor=INK,spaceAfter=20,wordWrap="CJK"),
 "heading":ParagraphStyle("heading",fontName="CN",fontSize=17,leading=25,textColor=INK,spaceAfter=10,wordWrap="CJK"),
 "body":ParagraphStyle("body",fontName="CN",fontSize=10.5,leading=18,textColor=INK,spaceAfter=9,wordWrap="CJK"),
 "small":ParagraphStyle("small",fontName="CN",fontSize=8.5,leading=14,textColor=MUTED,spaceAfter=8,wordWrap="CJK"),
 "prompt":ParagraphStyle("prompt",fontName="CN",fontSize=10.5,leading=18,textColor=INK,backColor=colors.HexColor("#edf5f3"),borderPadding=12,spaceBefore=9,spaceAfter=19,wordWrap="CJK"),
 "label":ParagraphStyle("label",fontName="CN",fontSize=9,leading=16,textColor=TEAL,spaceAfter=8,wordWrap="CJK")
}
def p(text,style="body"):
    return Paragraph(escape(text),styles[style])
def page(c,doc):
    c.setStrokeColor(colors.HexColor("#cbd7d5"));c.line(44,800,551,800);c.line(44,39,551,39)
    c.setFont("CN",8);c.setFillColor(MUTED);c.drawString(44,810,"Haoming Luo · AgentFEM")
    c.drawString(44,25,"lab.haoming-luo.com/learn/");c.drawRightString(551,25,str(doc.page))
story=[Spacer(1,24),p("入门练习 / 四个小案例","label"),p(DATA["title"],"title"),p(DATA["intro"]),Spacer(1,14),p("先确认 AI 能调用软件","heading"),p("在 Codex 等具有工具调用能力的 AI 助手中，打开练习文件夹，先发送下面这段话。只有聊天、尚未接入 AgentFEM 的助手不能直接运行仿真。"),p(DATA["ready"],"prompt"),p("确认可用后，再发一次","heading"),p(DATA["common"],"prompt"),p("然后，从下一页选一个案例开始。每页先给出问题，再给提示词和参考结果。完成后，还可以复制“再问一句”，比较不同条件下的结果。"),Spacer(1,10)]
for x in DATA["lessons"]:story.append(p(x["number"]+"  "+x["title"]))
story.extend([Spacer(1,15),Paragraph('安装与连接：<link href="https://github.com/haoming-luo/agentfem/blob/main/INSTALL.md" color="#237a78">AgentFEM 安装说明</link> · <link href="https://haoming-luo.github.io/agentfem/agents/mcp/" color="#237a78">AI 助手连接说明</link>。Windows 使用 WSL2。',styles["small"]),p("提示词可以直接选中复制。网页版提供复制按钮、完整建模说明和版本记录。参考结果用 AgentFEM 0.4.0.dev0 / DOLFINx 0.11.0 于 2026-10-07 计算，供入门学习。","small")])
for x in DATA["lessons"]:
    story.extend([PageBreak(),p(x["number"]+" / "+x["label"],"label"),p(x["title"],"heading"),p(x["problem"]),p(x["prompt"],"prompt")])
    img=Image(str(ROOT/f'public/learn/assets/{x["id"]}.png'))
    img.drawHeight=img.imageHeight/img.imageWidth*475;img.drawWidth=475
    story.extend([img,Spacer(1,8),p(x["result"],"heading"),p(x["read"]),p("再问一句","label"),p(x["follow"],"prompt"),p(x["takeaway"]),p(x["technical"],"small")])
out=ROOT/"public/learn/AgentFEM-first-simulations.pdf"
doc=SimpleDocTemplate(str(out),pagesize=(595.28,841.89),rightMargin=44,leftMargin=44,topMargin=56,bottomMargin=50,title=DATA["title"],author="Haoming Luo · AgentFEM")
doc.build(story,onFirstPage=page,onLaterPages=page)
print(out)
