const secretPatterns: RegExp[] = [
  /([A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY|PRIVATE_KEY)[A-Z0-9_]*=)[^\s]+/gi,
  /(Bearer\s+)[A-Za-z0-9._~+/=-]+/gi,
  /(postgres(?:ql)?:\/\/[^:\s]+:)[^@\s]+(@)/gi,
];

export const redactSecrets = (value: string): string => {
  return secretPatterns.reduce((current, pattern) => current.replace(pattern, "$1[REDACTED]$2"), value);
};
