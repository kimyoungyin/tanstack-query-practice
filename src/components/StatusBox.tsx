export default function StatusBox({
    status,
    title,
    description,
}: {
    status: boolean;
    title: string;
    description: string;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: status ? "#d4edda" : "#fff3cd",
                padding: "8px 16px",
                borderRadius: "4px",
                marginBottom: "20px",
            }}
        >
            <strong>{title}: </strong>
            <p>{description}</p>
        </div>
    );
}
