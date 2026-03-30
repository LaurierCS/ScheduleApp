const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const splitEmailInput = (value: string): string[] => {
    return value
        .split(/[\n,;\s]+/)
        .map((item) => item.trim())
        .filter(Boolean);
};

export const dedupeEmails = (emails: string[]): string[] => {
    const normalized = emails.map((email) => email.toLowerCase());
    return Array.from(new Set(normalized));
};

export const parseEmailList = (value: string) => {
    const rawItems = splitEmailInput(value);
    const emails: string[] = [];
    const invalid: string[] = [];

    rawItems.forEach((item) => {
        if (EMAIL_PATTERN.test(item)) {
            emails.push(item.toLowerCase());
        } else {
            invalid.push(item);
        }
    });

    return {
        emails: dedupeEmails(emails),
        invalid: dedupeEmails(invalid),
    };
};

const splitCsvLine = (line: string): string[] => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === "," && !inQuotes) {
            cells.push(current.trim());
            current = "";
            continue;
        }

        current += char;
    }

    cells.push(current.trim());
    return cells.map((cell) => cell.replace(/^"|"$/g, "").trim());
};

export const parseInviteCsv = (content: string) => {
    const rows = content.replace(/\r/g, "").split("\n").filter((line) => line.trim());

    if (rows.length === 0) {
        return { emails: [], invalid: [], hasHeader: false, rowCount: 0 };
    }

    const headerCells = splitCsvLine(rows[0]);
    let emailIndex = headerCells.findIndex((cell) => cell.toLowerCase() === "email");
    let startRow = 0;
    let hasHeader = false;

    if (emailIndex >= 0) {
        hasHeader = true;
        startRow = 1;
    } else {
        emailIndex = 0;
    }

    const emails: string[] = [];
    const invalid: string[] = [];

    for (let i = startRow; i < rows.length; i += 1) {
        const cells = splitCsvLine(rows[i]);
        const candidate = (cells[emailIndex] || "").trim();

        if (!candidate) {
            continue;
        }

        if (EMAIL_PATTERN.test(candidate)) {
            emails.push(candidate.toLowerCase());
        } else {
            invalid.push(candidate);
        }
    }

    return {
        emails: dedupeEmails(emails),
        invalid: dedupeEmails(invalid),
        hasHeader,
        rowCount: rows.length - (hasHeader ? 1 : 0),
    };
};
