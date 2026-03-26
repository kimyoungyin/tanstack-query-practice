export default function StatusBox({
    status,
    title,
    description,
}: {
    status: boolean;
    title: string;
    description: string;
}) {
    const statusClassName = status ? "status-success" : "status-warning";

    return (
        <div className={`card ${statusClassName}`}>
            <p>
                <strong>{title}: </strong>
                {description}
            </p>
        </div>
    );
}
