import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatMessage',
  standalone: true
})
export class FormatMessagePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Reemplazar saltos de línea con <br>
    let formatted = value.replace(/\n/g, '<br>');

    // Formatear listas con asteriscos
    formatted = formatted.replace(/\* (.*?)(?=\n|$)/g, '<br>• $1');

    // Formatear negritas (**texto**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Formatear enlaces [texto](url) - Corregido escape
    formatted = formatted.replace(/\[(.*?)]\((.*?)\)/g, '<a href="$2" target="_blank" class="product-link">$1</a>');

    return formatted;
  }
}
