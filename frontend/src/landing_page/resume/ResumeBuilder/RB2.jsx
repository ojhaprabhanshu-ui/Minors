import React from 'react';
import resumebuild1 from "../../../resources/images/r1img.png";
import resumebuild2 from "../../../resources/images/r2img.png";
import resumebuild3 from "../../../resources/images/r3img.png";
import resumebuild4 from "../../../resources/images/r4img.png";

export default function RB2() {
    const steps = [
        {
            id: 1,
            image: resumebuild1,
            description: "Pick a template.",
        },
        {
            id: 2,
            image: resumebuild2,
            description: "Fill in the blanks using expert tips.",
        },
        {
            id: 3,
            image: resumebuild3,
            description: "Personalise your document.",
        },
        {
            id: 4,
            image: resumebuild4,
            description: "And download in DOCX or PDF.",
        },
    ];

    return (
        <section style={styles.container}>
            <h2 style={styles.heading}>Just four simple steps to download your resume:</h2>
            
            <div style={styles.stepsWrapper}>
                {steps.map((step) => (
                    <div key={step.id} style={styles.stepCard}>
                        <div style={styles.imageWrapper}>
                            <img src={step.image} alt={step.description} style={styles.image} />
                        </div>
                        <div style={styles.badge}>{step.id}</div>
                        <p style={styles.description}>{step.description}</p>
                    </div>
                ))}
            </div>

            <button style={styles.button}>CREATE YOUR RESUME</button>
        </section>
    );
}

const styles = {
    container: {
        textAlign: 'center',
        padding: '60px 20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
    },
    heading: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: '50px',
    },
    stepsWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto 50px auto',
        flexWrap: 'wrap',
    },
    stepCard: {
        flex: '1',
        minWidth: '220px',
        maxWidth: '260px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    imageWrapper: {
        width: '100%',
        height: '220px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
    },
    image: {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
    },
    badge: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: '#4B92FF',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '16px',
        marginBottom: '16px',
    },
    description: {
        fontSize: '16px',
        color: '#333333',
        lineHeight: '1.4',
        margin: '0',
    },
    button: {
        backgroundColor: '#A82D2D',
        color: '#ffffff',
        border: 'none',
        padding: '16px 40px',
        borderRadius: '30px',
        fontSize: '16px',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
};