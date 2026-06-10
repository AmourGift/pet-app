import streamlit as st
import streamlit.components.v1 as components

st.set_page_col_config = {
    "page_title": "Companion Hub",
    "layout": "wide"
}

st.title("🐾 Strategic Companion Telemetry Dashboard")
st.write("Below is the real-time React telemetry, GPS tracker, and Voice Identification suite:")

# Option A: Embed from your web deployment URL
components.iframe(
    src="https://ais-pre-kdame5gqb4x2ifgtibwfo5-770548500027.asia-east1.run.app", 
    height=850, 
    scrolling=True
)