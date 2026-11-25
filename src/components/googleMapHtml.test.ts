import { describe, expect, it } from 'vitest';
import {
  buildGoogleMapHtml,
  buildMapUpdateScript,
  parseMapToAppMessage,
  serializeMapState,
} from './googleMapHtml';

const tokyoState = {
  tripId: 'tokyo',
  markers: [
    {
      id: 'tk-1',
      name: 'Trunk Hotel Yoyogi Park',
      category: 'Hotel' as const,
      x: 28,
      y: 34,
    },
  ],
  selectedId: 'tk-1',
  dropPinMode: false,
  dropPin: null,
  showRoute: true,
};

describe('parseMapToAppMessage', () => {
  it('accepts known map messages and rejects junk', () => {
    expect(parseMapToAppMessage('{"type":"ready"}')).toEqual({ type: 'ready' });
    expect(parseMapToAppMessage('{"type":"select","id":"tk-2"}')).toEqual({ type: 'select', id: 'tk-2' });
    expect(parseMapToAppMessage('{"type":"drop","lat":35.66,"lng":139.74}')).toEqual({
      type: 'drop',
      lat: 35.66,
      lng: 139.74,
    });
    expect(parseMapToAppMessage('{"type":"drop","lat":"35","lng":139}')).toBeNull();
    expect(parseMapToAppMessage('not-json')).toBeNull();
    expect(parseMapToAppMessage('{"type":"explode"}')).toBeNull();
  });
});

describe('buildGoogleMapHtml', () => {
  it('embeds the SDK script, API key, and Tokyo marker payload', () => {
    const html = buildGoogleMapHtml({ ...tokyoState, apiKey: 'test-key' });
    expect(html).toContain('https://maps.googleapis.com/maps/api/js?key=test-key&callback=initMap');
    expect(html).toContain('Trunk Hotel Yoyogi Park');
    const payload = serializeMapState(tokyoState);
    expect(payload).toContain('tk-1');
    expect(payload).not.toContain('<');
    const marker = JSON.parse(payload).markers[0];
    expect(marker.lat).toBeGreaterThan(35);
    expect(marker.lat).toBeLessThan(36);
    expect(marker.lng).toBeGreaterThan(139);
    expect(marker.lng).toBeLessThan(140);
  });

  it('builds an injectable update script from the current state', () => {
    const script = buildMapUpdateScript(tokyoState);
    expect(script.startsWith('window.__tripmixUpdate && window.__tripmixUpdate(')).toBe(true);
    expect(script.endsWith('); true;')).toBe(true);
  });
});
