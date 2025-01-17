function simplecollide(my, n) {
    let diff = (1 + util.getDistance(my, n) / 2) * roomSpeed;
    let a = (my.intangibility) ? 1 : my.pushability,
        b = (n.intangibility) ? 1 : n.pushability,
        c = 0.05 * (my.x - n.x) / diff,
        d = 0.05 * (my.y - n.y) / diff;
    my.accel.x += a / (b + 0.3) * c;
    my.accel.y += a / (b + 0.3) * d;
    n.accel.x -= b / (a + 0.3) * c;
    n.accel.y -= b / (a + 0.3) * d;
}

function firmcollide(my, n, buffer = 0) {
    let item1 = {
        x: my.x + my.m_x,
        y: my.y + my.m_y,
    };
    let item2 = {
        x: n.x + n.m_x,
        y: n.y + n.m_y,
    };
    let dist = util.getDistance(item1, item2);
    let s1 = Math.max(my.velocity.length, my.topSpeed);
    let s2 = Math.max(n.velocity.length, n.topSpeed);
    let strike1, strike2;
    if (buffer > 0 && dist <= my.realSize + n.realSize + buffer) {
        let repel = (my.acceleration + n.acceleration) * (my.realSize + n.realSize + buffer - dist) / buffer / roomSpeed;
        my.accel.x += repel * (item1.x - item2.x) / dist;
        my.accel.y += repel * (item1.y - item2.y) / dist;
        n.accel.x -= repel * (item1.x - item2.x) / dist;
        n.accel.y -= repel * (item1.y - item2.y) / dist;
    }
    let cycles = 0; while (dist <= my.realSize + n.realSize && !(strike1 && strike2) && cycles < 150) { cycles += 1;
        strike1 = false;
        strike2 = false;
        if (my.velocity.length <= s1) {
            my.velocity.x -= 0.05 * (item2.x - item1.x) / dist / roomSpeed;
            my.velocity.y -= 0.05 * (item2.y - item1.y) / dist / roomSpeed;
        } else {
            strike1 = true;
        }
        if (n.velocity.length <= s2) {
            n.velocity.x += 0.05 * (item2.x - item1.x) / dist / roomSpeed;
            n.velocity.y += 0.05 * (item2.y - item1.y) / dist / roomSpeed;
        } else {
            strike2 = true;
        }
        item1 = {
            x: my.x + my.m_x,
            y: my.y + my.m_y,
        };
        item2 = {
            x: n.x + n.m_x,
            y: n.y + n.m_y,
        };
        dist = util.getDistance(item1, item2);
    }
}

function reflectcollide(wall, bounce) {
    let delt = new Vector(wall.x - bounce.x, wall.y - bounce.y);
    let dist = delt.length;
    let diff = wall.size + bounce.size - dist;
    if (diff > 0) {
        bounce.accel.x -= diff * delt.x / dist;
        bounce.accel.y -= diff * delt.y / dist;
        return 1;
    }
    return 0;
}

function advancedcollide(my, n, doDamage, doInelastic, nIsFirmCollide = false) {
    // Prepare to check
    let tock = Math.min(my.stepRemaining, n.stepRemaining),
        combinedRadius = n.size + my.size,
        motion = {
            _me: new Vector(my.m_x, my.m_y),
            _n: new Vector(n.m_x, n.m_y),
        },
        delt = new Vector(
            tock * (motion._me.x - motion._n.x),
            tock * (motion._me.y - motion._n.y)
        ),
        diff = new Vector(my.x - n.x, my.y - n.y),
        dir = new Vector((n.x - my.x) / diff.length, (n.y - my.y) / diff.length),
        component = Math.max(0, dir.x * delt.x + dir.y * delt.y);
    if (component >= diff.length - combinedRadius) { // A simple check
        // A more complex check
        let goahead = false,
            tmin = 1 - tock,
            tmax = 1,
            A = Math.pow(delt.x, 2) + Math.pow(delt.y, 2),
            B = 2 * delt.x * diff.x + 2 * delt.y * diff.y,
            C = Math.pow(diff.x, 2) + Math.pow(diff.y, 2) - Math.pow(combinedRadius, 2),
            det = B * B - (4 * A * C),
            t;
        if (!A || det < 0 || C < 0) { // This shall catch mathematical errors
            t = 0;
            if (C < 0) { // We have already hit without moving
                goahead = true;
            }
        } else {
            let t1 = (-B - Math.sqrt(det)) / (2 * A),
                t2 = (-B + Math.sqrt(det)) / (2 * A);
            if (t1 < tmin || t1 > tmax) { // 1 is out of range
                if (t2 < tmin || t2 > tmax) { // 2 is out of range;
                    t = false;
                } else { // 1 is out of range but 2 isn't
                    t = t2;
                    goahead = true;
                }
            } else { // 1 is in range
                if (t2 >= tmin && t2 <= tmax) { // They're both in range!
                    t = Math.min(t1, t2);
                    goahead = true; // That means it passed in and then out again.  Let's use when it's going in
                } else { // Only 1 is in range
                    t = t1;
                    goahead = true;
                }
            }
        }
        /********* PROCEED ********/
        if (goahead) {
            // Add to record
            my.collisionArray.push(n);
            n.collisionArray.push(my);
            if (t) { // Only if we still need to find the collision
                // Step to where the collision occured
                my.x += motion._me.x * t;
                my.y += motion._me.y * t;
                n.x += motion._n.x * t;
                n.y += motion._n.y * t;
                my.stepRemaining -= t;
                n.stepRemaining -= t;
                // Update things
                diff = new Vector(my.x - n.x, my.y - n.y);
                dir = new Vector((n.x - my.x) / diff.length, (n.y - my.y) / diff.length);
                component = Math.max(0, dir.x * delt.x + dir.y * delt.y);
            }
            let componentNorm = component / delt.length;
            /************ APPLY COLLISION ***********/
            // Prepare some things
            let reductionFactor = 1,
                deathFactor = {
                    _me: 1,
                    _n: 1,
                },
                accelerationFactor = (delt.length) ? (
                    (combinedRadius / 4) / (Math.floor(combinedRadius / delt.length) + 1)
                ) : (
                    0.001
                ),
                depth = {
                    _me: util.clamp((combinedRadius - diff.length) / (2 * my.size), 0, 1), //1: I am totally within it
                    _n: util.clamp((combinedRadius - diff.length) / (2 * n.size), 0, 1), //1: It is totally within me
                },
                combinedDepth = {
                    up: depth._me * depth._n,
                    down: (1 - depth._me) * (1 - depth._n),
                },
                pen = {
                    _me: {
                        sqr: Math.pow(my.penetration, 2),
                        sqrt: Math.sqrt(my.penetration),
                    },
                    _n: {
                        sqr: Math.pow(n.penetration, 2),
                        sqrt: Math.sqrt(n.penetration),
                    },
                },
                savedHealthRatio = {
                    _me: my.health.ratio,
                    _n: n.health.ratio,
                };
            if (doDamage) {
                let speedFactor = { // Avoid NaNs and infinities
                    _me: my.maxSpeed ? Math.pow(motion._me.length / my.maxSpeed, 0.25) : 1,
                    _n: n.maxSpeed ? Math.pow(motion._n.length / n.maxSpeed, 0.25) : 1,
                };
                /********** DO DAMAGE *********/
                let bail = false;
                if (my.type === "atmosphere" && !(n.type === "tank" || n.type === "miniboss")) {
                    bail = true;
                } else if (n.type === "atmosphere" && !(my.type === "tank" || my.type === "miniboss")) {
                    bail = true;
                }
                if (n.type === 'food' && my.settings.necroTypes.includes(n.shape)) {
                    bail = my.necro(n);
                } else if (my.type === 'food' && n.settings.necroTypes.includes(my.shape)) {
                    bail = n.necro(my);
                }
                if (!bail) {
                    // Calculate base damage
                    let resistDiff = my.health.resist - n.health.resist,
                        damage = {
                            _me: c.DAMAGE_CONSTANT * my.damage * (1 + resistDiff) * (1 + n.heteroMultiplier  * (my.settings.damageClass === n.settings.damageClass)) * ((my.settings.buffVsFood && n.settings.damageType === 1) ? 3 : 1) * my.damageMultiplier() * Math.min(2, Math.max(speedFactor._me, 1) * speedFactor._me),
                            _n:  c.DAMAGE_CONSTANT * n.damage  * (1 - resistDiff) * (1 + my.heteroMultiplier * (my.settings.damageClass === n.settings.damageClass)) * ((n.settings.buffVsFood && my.settings.damageType === 1) ? 3 : 1) * n.damageMultiplier()  * Math.min(2, Math.max(speedFactor._n , 1) * speedFactor._n ),
                        };
                    // Advanced damage calculations
                    if (my.settings.ratioEffects) {
                        damage._me *= Math.min(1, Math.pow(Math.max(my.health.ratio, my.shield.ratio), 1 / my.penetration));
                    }
                    if (n.settings.ratioEffects) {
                        damage._n *= Math.min(1, Math.pow(Math.max(n.health.ratio, n.shield.ratio), 1 / n.penetration));
                    }
                    if (my.settings.damageEffects) {
                        damage._me *=
                            accelerationFactor *
                            (1 + (componentNorm - 1) * (1 - depth._n) / my.penetration) *
                            (1 + pen._n.sqrt * depth._n - depth._n) / pen._n.sqrt;
                    }
                    if (n.settings.damageEffects) {
                        damage._n *=
                            accelerationFactor *
                            (1 + (componentNorm - 1) * (1 - depth._me) / n.penetration) *
                            (1 + pen._me.sqrt * depth._me - depth._me) / pen._me.sqrt;
                    }
                    // Find out if you'll die in this cycle, and if so how much damage you are able to do to the other target
                    let damageToApply = {
                        _me: damage._me,
                        _n: damage._n,
                    };
                    if (n.shield.max) {
                        damageToApply._me -= n.shield.getDamage(damageToApply._me);
                    }
                    if (my.shield.max) {
                        damageToApply._n -= my.shield.getDamage(damageToApply._n);
                    }
                    let stuff = my.health.getDamage(damageToApply._n, false);
                    deathFactor._me = (stuff > my.health.amount) ? my.health.amount / stuff : 1;
                    stuff = n.health.getDamage(damageToApply._me, false);
                    deathFactor._n = (stuff > n.health.amount) ? n.health.amount / stuff : 1;
                    reductionFactor = Math.min(deathFactor._me, deathFactor._n);
                    // Now apply it
                    my.damageRecieved += damage._n * deathFactor._n > 0
                        ? (my.team != n.team
                            ? damage._n * deathFactor._n
                            : 0)
                        : (n.healer && n.team == my.team && my.type == "tank" && n.master.id != my.id
                            ? damage._n * deathFactor._n
                            : 0);
                    n.damageRecieved += damage._me * deathFactor._me > 0
                        ? (my.team != n.team
                            ? damage._me * deathFactor._me
                            : 0)
                        : (my.healer && my.team == n.team && n.type == "tank" && my.master.id != n.id
                            ? damage._me * deathFactor._me
                            : 0);
                }
            }
            /************* DO MOTION ***********/
            if (nIsFirmCollide < 0) {
                nIsFirmCollide *= -0.5;
                my.accel.x -= nIsFirmCollide * component * dir.x;
                my.accel.y -= nIsFirmCollide * component * dir.y;
                n.accel.x += nIsFirmCollide * component * dir.x;
                n.accel.y += nIsFirmCollide * component * dir.y;
            } else if (nIsFirmCollide > 0) {
                n.accel.x += nIsFirmCollide * (component * dir.x + combinedDepth.up);
                n.accel.y += nIsFirmCollide * (component * dir.y + combinedDepth.up);
            } else {
                // Calculate the impulse of the collision
                let elasticity = 2 - 4 * Math.atan(my.penetration * n.penetration) / Math.PI;
                if (doInelastic && my.settings.motionEffects && n.settings.motionEffects) {
                    elasticity *= savedHealthRatio._me / pen._me.sqrt + savedHealthRatio._n / pen._n.sqrt;
                } else {
                    elasticity *= 2;
                }
                let spring = 2 * Math.sqrt(savedHealthRatio._me * savedHealthRatio._n) / roomSpeed,
                    elasticImpulse =
                    Math.pow(combinedDepth.down, 2) *
                    elasticity * component *
                    my.mass * n.mass / (my.mass + n.mass),
                    springImpulse =
                    c.KNOCKBACK_CONSTANT * spring * combinedDepth.up,
                    impulse = -(elasticImpulse + springImpulse) * (1 - my.intangibility) * (1 - n.intangibility),
                    force = {
                        x: impulse * dir.x,
                        y: impulse * dir.y,
                    },
                    modifiers = {
                        _me: c.KNOCKBACK_CONSTANT * my.pushability / my.mass * deathFactor._n,
                        _n: c.KNOCKBACK_CONSTANT * n.pushability / n.mass * deathFactor._me,
                    };
                // Apply impulse as force
                my.accel.x += modifiers._me * force.x;
                my.accel.y += modifiers._me * force.y;
                n.accel.x -= modifiers._n * force.x;
                n.accel.y -= modifiers._n * force.y;
            }
        }
    }
}

function reflectCollide(wall, bounce) {
    if (bounce.god === true || bounce.passive === true || bounce.ac || bounce.master.ac) return;
    if (bounce.team === wall.team && bounce.type === "tank") return;
    if (bounce.x + bounce.size < wall.x - wall.size ||
        bounce.x - bounce.size > wall.x + wall.size ||
        bounce.y + bounce.size < wall.y - wall.size ||
        bounce.y - bounce.size > wall.y + wall.size) return 0;
    if (wall.intangibility) return 0;
    let bounceBy = bounce.type === 'tank' ? 1.0 : bounce.type === 'miniboss' ? 2.5 : 0.1,
        left = bounce.x < wall.x - wall.size,
        right = bounce.x > wall.x + wall.size,
        top = bounce.y < wall.y - wall.size,
        bottom = bounce.y > wall.y + wall.size,
        leftExposed = bounce.x - bounce.size < wall.x - wall.size,
        rightExposed = bounce.x + bounce.size > wall.x + wall.size,
        topExposed = bounce.y - bounce.size < wall.y - wall.size,
        bottomExposed = bounce.y + bounce.size > wall.y + wall.size,
        intersected = true;

    if (left && right) {
        left = right = false
    }
    if (top && bottom) {
        top = bottom = false
    }
    if (leftExposed && rightExposed) {
        leftExposed = rightExposed = false
    }
    if (topExposed && bottomExposed) {
        topExposed = bottomExposed = false
    }
    if ((left && !top && !bottom) || (leftExposed && !topExposed && !bottomExposed)) {
        bounce.accel.x -= (bounce.x + bounce.size - wall.x + wall.size) * bounceBy
    } else if ((right && !top && !bottom) || (rightExposed && !topExposed && !bottomExposed)) {
        bounce.accel.x -= (bounce.x - bounce.size - wall.x - wall.size) * bounceBy
    } else if ((top && !left && !right) || (topExposed && !leftExposed && !rightExposed)) {
        bounce.accel.y -= (bounce.y + bounce.size - wall.y + wall.size) * bounceBy
    } else if ((bottom && !left && !right) || (bottomExposed && !leftExposed && !rightExposed)) {
        bounce.accel.y -= (bounce.y - bounce.size - wall.y - wall.size) * bounceBy
    } else {
        let x = leftExposed ? -wall.size : rightExposed ? wall.size : 0
        let y = topExposed ? -wall.size : bottomExposed ? wall.size : 0

        let point = new Vector(wall.x + x - bounce.x, wall.y + y - bounce.y)

        if (!x || !y) {
            if (bounce.x + bounce.y < wall.x + wall.y) { // top left
                if (bounce.x - bounce.y < wall.x - wall.y) { // bottom left
                    bounce.accel.x -= (bounce.x + bounce.size - wall.x + wall.size) * bounceBy
                } else { // top right
                    bounce.accel.y -= (bounce.y + bounce.size - wall.y + wall.size) * bounceBy
                }
            } else { // bottom right
                if (bounce.x - bounce.y < wall.x - wall.y) { // bottom left
                    bounce.accel.y -= (bounce.y - bounce.size - wall.y - wall.size) * bounceBy
                } else { // top right
                    bounce.accel.x -= (bounce.x - bounce.size - wall.x - wall.size) * bounceBy
                }
            }
        } else if (!(left || right || top || bottom)) {
            let force = (bounce.size / point.length - 1) * bounceBy / 2
            bounce.accel.x += point.x * force
            bounce.accel.y += point.y * force
        } else if (point.isShorterThan(bounce.size)) {
            //let force = (bounce.size - point.length) / point.length * bounceBy
            // once to get collision amount, once to norm
            let force = (bounce.size / point.length - 1) * bounceBy / 2 // simplified
            bounce.accel.x -= point.x * force
            bounce.accel.y -= point.y * force
        } else {
            intersected = false
        }
    }

    if (intersected) {
        bounce.collisionArray.push(wall);
        if (bounce.type !== 'tank' && bounce.type !== 'miniboss' && bounce.type !== "crasher" && bounce.type !== "food")
            bounce.kill();
    }
};

module.exports = {
    simplecollide,
    firmcollide,
    reflectcollide,
    advancedcollide,
    reflectCollide
};