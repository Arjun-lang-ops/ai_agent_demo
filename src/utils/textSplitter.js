const splitText = (
    text,
    chunkSize = 1000,
    chunkOverlap = 150
) => {

    if (!text || typeof text !== "string") {
        throw new Error("Valid text is required.");
    }

    if (chunkSize <= 0 || chunkOverlap < 0 ||
        chunkOverlap >= chunkSize) {
        throw new Error("Invalid chunk size or overlap.");
    }

    const cleanText = text
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .trim();

    if (!cleanText) {
        return [];
    }

    const chunks = [];

    let start = 0;

    while (start < cleanText.length) {

        let end = Math.min(
            start + chunkSize,
            cleanText.length
        );

        // Try to end at a natural text boundary
        if (end < cleanText.length) {

            const separators = [
                "\n\n",
                "\n",
                ". ",
                "? ",
                "! ",
                " "
            ];

            const searchStart = start + Math.floor(
                chunkSize * 0.6
            );

            let bestBoundary = -1;

            for (const separator of separators) {

                const boundary = cleanText.lastIndexOf(
                    separator,
                    end
                );

                if (boundary >= searchStart && boundary > bestBoundary) {
                    bestBoundary = boundary + separator.length;
                }
            }

            if (bestBoundary > start) {
                end = bestBoundary;
            }
        }

        const chunk = cleanText
            .slice(start, end)
            .trim();

        if (chunk) {
            chunks.push(chunk);
        }

        if (end >= cleanText.length) {
            break;
        }

        // Move forward while retaining overlapping text
        const nextStart = end - chunkOverlap;

        start = Math.max(
            start + 1,
            nextStart
        );

    }

    return chunks;
};

export default splitText;