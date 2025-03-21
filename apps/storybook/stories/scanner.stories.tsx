import { BarcodeScanner } from "@joyfourl/ui";
import { Meta } from "@storybook/react";

export default {
    component: BarcodeScanner
} satisfies Meta

export const Default = {
    render() {
        return 'BarcodeDetector' in window ? <BarcodeScanner /> : <BarcodeScanner />
    }
}