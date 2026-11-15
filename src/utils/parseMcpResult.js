export const parseMcpResult = (result) => {

  if (result.isError) {
    throw new Error("MCP tool execution failed");
  }

  const text = result
    .filter
    ? ""
    : result.content
        ?.filter(item => item.type === "text")
        .map(item => item.text)
        .join("\n");

  if (!text) {
    return [];
  }

  try {

    return JSON.parse(text);

  } catch {

    return text;

  }

};