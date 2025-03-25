import { Point2D } from "barcode-detector/ponyfill"
import { munkres } from "munkres"

export function drawPolygones(canvas: HTMLCanvasElement, polygons: Point2D[][]) {

    const context = canvas.getContext('2d')
    if (context == null) return

    context.clearRect(0, 0, canvas.width, canvas.height)

    for (const points of polygons) {
        if (points.length < 1) continue
        context.beginPath()
        context.moveTo(points[0].x, points[0].y)
        points.slice(1).forEach(({ x, y }) => context.lineTo(x, y))
        context.closePath()
        context.strokeStyle = 'red'
        context.lineWidth = 2
        context.stroke()
    }
}

export function getCenterPoint(points: Point2D[]): Point2D {
    if (points.length == 0) throw Error('you must provide at-least one point')
    if (points.length == 1) return points[0]
    const { x, y } = points.reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y }), { x: 0, y: 0 })
    return { x: x / points.length, y: y / points.length }
}
export function distance(first: Point2D, second: Point2D) {
    const dx = first.x - second.x
    const dy = first.y - second.y
    return Math.sqrt(dx * dx + dy * dy)
}

export const buildCostMatrix = (newValue: Point2D[], oldValue: Point2D[]): number[][] => {
    return oldValue.map(newPoint => newValue.map(oldPoint => distance(newPoint, oldPoint)))
}

export const reorder = (newValue: Point2D[], oldValue: Point2D[]): Point2D[] => {
    const result = munkres(buildCostMatrix(newValue, oldValue))
    return result.sort(o => o[0]).map(o => newValue[o[1]])
}

export function smoothPoints(newValue: Point2D[], oldValue: Point2D[], alpha = 0.2): Point2D[] {
    if (!newValue || !oldValue || newValue.length !== oldValue.length) {
        throw new Error("newValue 和 oldValue 必须存在且长度一致")
    }

    return newValue.map((currentPoint, i) => {
        const previousPoint = oldValue[i];
        return {
            x: alpha * currentPoint.x + (1 - alpha) * previousPoint.x,
            y: alpha * currentPoint.y + (1 - alpha) * previousPoint.y
        }
    })
}

export type { Point2D }