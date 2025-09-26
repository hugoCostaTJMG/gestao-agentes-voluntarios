package br.gov.corregedoria.agentes.util;

public final class DocumentoUtil {

    private DocumentoUtil() {}

    public static String cleanDigits(String s) {
        if (s == null) return "";
        return s.replaceAll("\\D", "");
    }

    public static boolean isValidCPF(String cpf) {
        String digits = cleanDigits(cpf);
        if (digits.length() != 11) return false;
        // Rejeita sequências repetidas
        if (digits.chars().distinct().count() == 1) return false;

        try {
            int d1 = calcCpfDigit(digits.substring(0, 9), 10);
            int d2 = calcCpfDigit(digits.substring(0, 9) + d1, 11);
            return digits.equals(digits.substring(0, 9) + d1 + d2);
        } catch (Exception e) {
            return false;
        }
    }

    private static int calcCpfDigit(String base, int weightStart) {
        int sum = 0;
        for (int i = 0; i < base.length(); i++) {
            int num = base.charAt(i) - '0';
            sum += num * (weightStart - i);
        }
        int mod = sum % 11;
        return (mod < 2) ? 0 : (11 - mod);
    }

    public static boolean isValidCNPJ(String cnpj) {
        String digits = cleanDigits(cnpj);
        if (digits.length() != 14) return false;
        // Rejeita sequências repetidas
        if (digits.chars().distinct().count() == 1) return false;

        try {
            int d1 = calcCnpjDigit(digits.substring(0, 12));
            int d2 = calcCnpjDigit(digits.substring(0, 12) + d1);
            return digits.equals(digits.substring(0, 12) + d1 + d2);
        } catch (Exception e) {
            return false;
        }
    }

    private static int calcCnpjDigit(String base) {
        int[] weights = {6,5,4,3,2,9,8,7,6,5,4,3,2};
        int sum = 0;
        for (int i = 0; i < base.length(); i++) {
            int num = base.charAt(i) - '0';
            sum += num * weights[weights.length - base.length() + i];
        }
        int mod = sum % 11;
        return (mod < 2) ? 0 : (11 - mod);
    }
}

