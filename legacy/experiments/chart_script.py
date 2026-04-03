
# Create a mermaid flowchart for the Upwork automation system workflow

diagram_code = """
flowchart TD
    Node1[START: Scraping Opportunities]
    Node2[Browser Agentic<br/>Chromium]
    Node3[Upwork Login<br/>+ Cookies]
    Node4[Extract Opportunity Data<br/>from Best Matches]
    Node5[(Save to Database)]
    Node6[Scoring Engine<br/>0-100]
    Node7[Sort & Select<br/>Top 3]
    Node8[LLM Analysis<br/>Claude API]
    Node9[Generate Proposal<br/>+ Estimation]
    Node10[(Save Draft<br/>Proposal)]
    Node11[🟢 DAILY: User<br/>Reviews Dashboard]
    Node12[Edit/Refine<br/>Proposal]
    Node13[📤 Send to<br/>Upwork]
    Node14[📊 Monitoring<br/>Responses]
    Node15[(Update<br/>Proposal Status)]
    Node16[🔔 Notify User<br/>of Responses]
    
    Node1 --> Node2
    Node2 --> Node3
    Node3 --> Node4
    Node4 --> Node5
    Node5 --> Node6
    Node6 --> Node7
    Node7 --> Node8
    Node8 --> Node9
    Node9 --> Node10
    Node10 -->|⏰ 1x/dia| Node11
    Node11 -->|opcional| Node12
    Node12 --> Node13
    Node13 --> Node14
    Node14 --> Node15
    Node15 --> Node16
    
    style Node1 fill:#3b82f6,stroke:#1e40af,color:#fff
    style Node2 fill:#3b82f6,stroke:#1e40af,color:#fff
    style Node3 fill:#3b82f6,stroke:#1e40af,color:#fff
    style Node4 fill:#3b82f6,stroke:#1e40af,color:#fff
    style Node5 fill:#eab308,stroke:#ca8a04,color:#000
    style Node6 fill:#3b82f6,stroke:#1e40af,color:#fff
    style Node7 fill:#3b82f6,stroke:#1e40af,color:#fff
    style Node8 fill:#3b82f6,stroke:#1e40af,color:#fff
    style Node9 fill:#3b82f6,stroke:#1e40af,color:#fff
    style Node10 fill:#eab308,stroke:#ca8a04,color:#000
    style Node11 fill:#22c55e,stroke:#16a34a,color:#fff
    style Node12 fill:#22c55e,stroke:#16a34a,color:#fff
    style Node13 fill:#22c55e,stroke:#16a34a,color:#fff
    style Node14 fill:#3b82f6,stroke:#1e40af,color:#fff
    style Node15 fill:#eab308,stroke:#ca8a04,color:#000
    style Node16 fill:#3b82f6,stroke:#1e40af,color:#fff
"""

# Create the mermaid diagram and save as png and svg
create_mermaid_diagram(diagram_code, 'upwork_automation_flowchart.png', 'upwork_automation_flowchart.svg', width=1400, height=1600)
