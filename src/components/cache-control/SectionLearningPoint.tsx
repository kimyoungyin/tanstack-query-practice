import type { ReactNode } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";

interface SectionLearningPointProps {
    title: string;
    points: ReactNode[];
    footnote?: ReactNode;
}

export default function SectionLearningPoint({
    title,
    points,
    footnote,
}: SectionLearningPointProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className="section-learning-trigger"
                onClick={() => setIsOpen(true)}
                type="button"
                aria-label={title}
                title={title}
            >
                i
            </button>
            {isOpen ? (
                createPortal(
                    <div
                        className="section-learning-modal-overlay"
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        onClick={() => setIsOpen(false)}
                    >
                        <div
                            className="card stack-sm section-learning-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="section-learning-modal-header">
                                <h4>{title}</h4>
                                <button
                                    type="button"
                                    className="section-learning-close"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="학습 포인트 닫기"
                                >
                                    ×
                                </button>
                            </div>
                            <ul>
                                {points.map((point, index) => (
                                    <li key={`${title}-${index}`}>{point}</li>
                                ))}
                            </ul>
                            {footnote ? <p className="muted">{footnote}</p> : null}
                        </div>
                    </div>,
                    document.body,
                )
            ) : null}
        </>
    );
}
