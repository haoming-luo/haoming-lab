"""Vector problem diagrams; geometry and boundary conditions, not solutions."""
import math
from reportlab.platypus import Flowable
from reportlab.lib.colors import HexColor, white

INK=HexColor('#343b40')
BLUE=HexColor('#336b85')
RED=HexColor('#aa503d')
PALE=HexColor('#eef1f2')

class ProblemDiagram(Flowable):
    def __init__(self,case):
        super().__init__(); self.case=case; self.width=499; self.height=112
    def draw(self):
        c=self.canv
        def line(x,y,X,Y,col=INK):
            c.setStrokeColor(col);c.setLineWidth(.8);c.line(x,y,X,Y)
        def text(x,y,s,col=INK,size=8):
            c.setFillColor(col);c.setFont('Hei',size);c.drawString(x,y,s)
        def rect(x,y,w,h):
            c.setFillColor(PALE);c.setStrokeColor(INK);c.setLineWidth(.9);c.rect(x,y,w,h,fill=1)
        def arrow(x,y,X,Y,col=INK):
            line(x,y,X,Y,col);a=math.atan2(Y-y,X-x)
            for da in [-.45,.45]:line(X,Y,X-5*math.cos(a+da),Y-5*math.sin(a+da),col)
        def dim(x,y,X,Y,label,tx,ty):
            arrow(x,y,X,Y);arrow(X,Y,x,y);text(tx,ty,label,size=7.5)
        def insulation(x,y,w,above=True):
            line(x,y,x+w,y)
            for dx in range(7,int(w),13):line(x+dx,y,x+dx+4,y+(5 if above else -5))
        if self.case==1:
            rect(65,47,260,25)
            line(65,36,65,84)
            for y in range(38,84,7):line(56,y-5,65,y)
            text(12,91,'左端固定')
            for x in [312,320,328]:arrow(x,78,x,40,RED)
            text(344,70,'总力 F = 200 N',RED)
            text(344,54,'均布于右端面',RED)
            dim(65,25,325,25,'L = 200 mm',159,13)
            dim(40,47,40,72,'20 mm',5,57)
            text(96,88,'平面应力；厚度 b = 10 mm')
            arrow(376,21,405,21);arrow(376,21,376,39)
            text(410,18,'x');text(365,40,'y')
        elif self.case==2:
            c.setStrokeColor(INK);c.setFillColor(PALE);c.circle(73,58,39,fill=1)
            c.setFillColor(white);c.circle(73,58,20,fill=1)
            for a in [0,math.pi/2,math.pi,3*math.pi/2]:
                arrow(73+10*math.cos(a),58+10*math.sin(a),73+20*math.cos(a),58+20*math.sin(a),RED)
            text(30,6,'横截面：内压向外',RED)
            arrow(73,58,100.6,85.6);text(114,87,'b = 50 mm')
            arrow(73,58,87.1,43.9);text(114,41,'a = 25 mm')
            text(114,64,'p = 10 MPa',RED)
            rect(280,28,53,66)
            for y in [40,60,80]:arrow(260,y,280,y,RED)
            line(244,25,244,98,BLUE)
            text(227,102,'z 轴',BLUE)
            dim(352,28,352,94,'100 mm',365,58)
            text(277,12,'轴对称计算区域')
            text(276,102,'全域轴向位移为零',BLUE)
            text(371,36,'外壁自由')
        else:
            if self.case==3:
                x,y,w,h=112,32,258,47
                rect(x,y,w,h)
                insulation(x,y+h,w);insulation(x,y,w,False)
                line(x,y,x,y+h,RED);line(x+w,y,x+w,y+h,BLUE)
                text(37,53,'100 ℃',RED,10);text(389,53,'20 ℃',BLUE,10)
                text(216,94,'上下绝热')
                dim(x,16,x+w,16,'100 mm',221,4)
                dim(93,y,93,y+h,'40 mm',54,84)
                c.setFillColor(INK);c.circle(x+w/2,y+h/2,2,fill=1)
                text(249,60,'中心测点')
            else:
                rect(26,36,132,47)
                text(39,56,'初始全板 20 ℃',BLUE,9)
                text(51,96,'初始状态')
                arrow(179,59,223,59);text(177,77,'开始加热')
                rect(277,36,151,47)
                insulation(277,83,151);insulation(277,36,151,False)
                line(277,36,277,83,RED);line(428,36,428,83,BLUE)
                text(238,57,'100 ℃',RED);text(437,57,'20 ℃',BLUE)
                text(303,96,'之后保持边界温度')
                c.setFillColor(INK);c.circle(352,60,2,fill=1)
                text(318,16,'记录中心温度随时间的变化')
                text(27,16,'板尺寸 100 mm × 40 mm')
