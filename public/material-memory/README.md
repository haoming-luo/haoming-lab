---
title: AgentFEM × DENIM · Material Memory Lab
emoji: 🧠
colorFrom: blue
colorTo: yellow
sdk: static
app_file: index.html
pinned: false
license: apache-2.0
short_description: Material memory meets physics-structured neural models
models:
- HaomingLuo/AgentFEM-DENIM
datasets:
- HaomingLuo/AgentFEM-Material-Loading-Memory
tags:
- mechanics
- scientific-machine-learning
- constitutive-modeling
- plasticity
- physics-ai
---

# AgentFEM × DENIM

**Give the network a memory. Keep the mechanics.**

Explore multiaxial loading, material memory, and a neural constitutive model with 918 trainable parameters.

- **Loading paths** — play hysteresis loops and compare AgentFEM, DENIM and GRU responses.
- **Model performance** — explore the results across two labeled experimental protocols.
- **Model architecture** — follow the information flow from pointwise networks to neural internal variables.

English / 中文 can be switched in the header. This lightweight Space plays precomputed model outputs; it does not run inference or FEM in the browser.

In the incomplete-physics protocol, DENIM reaches **1.136 MPa** Path-OOD RMSE, versus **59.541 MPa** for Incomplete J2 and **76.988 MPa** for GRU. The known-equation integrator is shown separately as a reference from a different protocol, not a theoretical bound.

[Model & code](https://huggingface.co/HaomingLuo/AgentFEM-DENIM) · [Dataset](https://huggingface.co/datasets/HaomingLuo/AgentFEM-Material-Loading-Memory) · [AgentFEM](https://github.com/haoming-luo/agentfem) · [Haoming Luo · Lab](https://lab.haoming-luo.com/)

## 中文

让网络记住材料，让力学保留在模型之中。

交互探索多轴加载、路径记忆与神经本构。包含路径响应、模型表现与模型架构三个视图，可在页首切换中英文。网页展示预计算数据，不在浏览器运行有限元或网络推理。模型适用于当前研究中的小应变、率无关 J2 塑性与合成材料数据。

Data source: AgentFEM-Material-Loading-Memory, revision 28b3c0d0315776dce214f21d1efe3a81b1981568.
Model source: AgentFEM-DENIM, revision 8fc04d09a1a670da61f3979c269681cc131d853e.
