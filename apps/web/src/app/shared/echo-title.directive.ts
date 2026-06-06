import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

/**
 * Renders a large, faded "echo" of a heading behind itself. Reads the host's
 * own text and exposes it via `data-echo`, which a CSS ::before draws.
 * Usage: `<h2 echo>Deployments</h2>`.
 */
@Directive({
  selector: '[echo]',
  host: { class: 'echo' },
})
export class EchoTitleDirective implements AfterViewInit {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    const text = (this.el.nativeElement.textContent ?? '').trim();
    if (text) {
      this.el.nativeElement.setAttribute('data-echo', text);
    }
  }
}
